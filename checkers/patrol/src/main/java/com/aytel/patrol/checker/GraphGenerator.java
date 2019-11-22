package com.aytel.patrol.checker;

import com.aytel.patrol.Graph;
import com.aytel.patrol.PatrolRequest;
import com.google.gson.Gson;
import org.apache.commons.cli.*;

import java.io.*;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static java.lang.Long.min;

public class GraphGenerator {
    public static TreeDecomposition generate(Random random, int n, int w, long bound, double makeEdge) throws FileNotFoundException {
        TreeDecomposition decomposition = TreeDecomposition.generate(random, n, w);
        //System.err.println("Built.");
        List<Set<Integer>> g = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            g.add(new HashSet<>());
        }

        int[] sz = new int[1];
        sz[0] = 1;

        Consumer<TreeDecomposition.Node> addEdges = (TreeDecomposition.Node node) -> {
            Set<Integer> cur = node.getVertices();
            sz[0] += 1;
            for (int v: cur) {
                for (int u: cur) {
                    if (v != u) {
                        if (random.nextDouble() < makeEdge) {
                            g.get(v).add(u);
                            g.get(u).add(v);
                        }
                    }
                }
            }
        };

        decomposition.apply(addEdges);

        Set<Graph.Edge> edges = new HashSet<>();
        int[] used = new int[n];
        int cnt = 0;
        List<Integer> sizes = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (used[i] == 0) {
                cnt++;
                sizes.add(markEdges(g, used, i, -1, edges));
            }
        }

        int e = 0;

        for (int i = 0; i < g.size(); i++) {
            //System.err.println(String.format("Edges of %d:", i));
            for (int u: g.get(i)) {
                e++;
                System.err.println(String.format("%d ", u));
            }
            //System.err.println();
        }

        //System.err.println(String.format("Total %d edges.", e / 2));
        //System.err.println(String.format("Total %d nodes.", sz[0]));
        //System.err.println(String.format("Total %d comps.", cnt));
        /*System.err.println(String.format("Sizes: %s.", sizes.stream()
            .map(Object::toString).collect(Collectors.joining(" "))));*/

        File out = new File("out.txt");
        PrintWriter writer = new PrintWriter(new BufferedOutputStream(new FileOutputStream(out)));

        writer.println("graph G {");

        for (Graph.Edge edge: edges) {
            writer.println(String.format("%d -- %d;", edge.getV(), edge.getU()));
        }

        writer.println("}");

        writer.flush();

        long[] weight = random.longs(n, 0, bound).toArray();
        Graph graph = new Graph(n, edges, weight);

        decomposition.setG(graph);

        File jsonOut = new File("graph.json");
        PrintWriter jsonWriter = new PrintWriter(new BufferedOutputStream(new FileOutputStream(jsonOut)));

        String json = new Gson().newBuilder().setPrettyPrinting().create().toJson(graph);
        jsonWriter.println(json);
        jsonWriter.flush();

        //System.err.flush();

        long ans = decomposition.maxIS();

        graph.setLimit(Arrays.stream(weight).sum() - ans);

        //Set<Integer> is = decomposition.getMaxIS();

        /*System.err.println(String.format("Weights: %s.", Arrays.stream(weight).boxed()
            .map(Object::toString).collect(Collectors.joining(" "))));*/
        //System.err.println(String.format("Ans: %d.", ans));
        /*System.err.println(String.format("IS: %s.", is.stream()
            .map(Object::toString).collect(Collectors.joining(" "))));*/

        if (n <= 20) {
            long best = (long)1e9;
            for (int mask = 0; mask < (1 << n); mask++) {
                if (isIS(mask, edges)) {
                    long cur = 0;
                    for (int i = 0; i < n; i++) {
                        if ((mask & (1 << i)) != 0)
                            cur += weight[i];
                    }
                    best = min(best, cur);
                }
            }

            assert(best == ans);
        }

        //System.err.flush();

        return decomposition;
    }

    private static boolean isIS(int mask, Set<Graph.Edge> edges) {
        for (Graph.Edge edge: edges) {
            int v = edge.getV(), u = edge.getU();
            if (((mask & (1 << v)) & (mask & (1 << u))) != 0)
                return false;
        }
        return true;
    }

    private static int markEdges(List<Set<Integer>> g, int[] used, int v, int p, Set<Graph.Edge> edges) {
        used[v] = 1;
        int result = 1;
        for (int u: g.get(v)) {
            if (u == p || used[u] == 2)
                continue;
            edges.add(new Graph.Edge(v, u));
            if (used[u] == 0) {
                result += markEdges(g, used, u, v, edges);
            }
        }
        used[v] = 2;
        return result;
    }

    public static void main(String[] args) throws IOException, ParseException {
        Options options = new Options();

        Option n = new Option("n", true, "size");
        Option w = new Option("w", true, "width");
        Option bound = new Option("b", true, "bound");
        Option p = new Option("p", true, "make edge");

        Option mode = new Option("m", true, "mode");

        Option seed = new Option("s", true, "seed");
        Option permSeed = new Option("ps", "ps", true, "perm seed");
        Option req = new Option("r", true, "request output file");

        Option id = new Option("id", "id", true,"id");
        Option rid = new Option("rid", "rid", true, "request id");
        Option flag = new Option("f", true, "flag");

        mode.setRequired(true);
        req.setRequired(true);

        options.addOption(n);
        options.addOption(w);
        options.addOption(bound);
        options.addOption(p);
        options.addOption(mode);
        options.addOption(seed);
        options.addOption(req);
        options.addOption(id);
        options.addOption(flag);
        options.addOption(rid);
        options.addOption(permSeed);

        CommandLineParser parser = new DefaultParser();
        CommandLine cmd = parser.parse(options, args);

        String type = cmd.getOptionValue("m");

        int _n = Integer.parseInt(cmd.getOptionValue("n", "300").trim());
        int _w = Integer.parseInt(cmd.getOptionValue("w", "5").trim());
        int _bound = Integer.parseInt(cmd.getOptionValue("b", "300").trim());
        double _p = Double.parseDouble(cmd.getOptionValue("p", "0.5").trim());
        long _seed = Long.parseLong(cmd.getOptionValue("s", String.valueOf(System.nanoTime())).trim());
        Random random = new Random(_seed);
        TreeDecomposition decomposition = generate(random, _n, _w, _bound, _p);
        Graph g = decomposition.getG();

        File out = new File("temp/" + cmd.getOptionValue("r"));
        FileWriter writer = new FileWriter(out);

        PatrolRequest patrolRequest;

        int[] perm;
        Graph iso;

        String _rid = cmd.getOptionValue("rid");

        switch (type) {
            case "create":
                g.setId(cmd.getOptionValue("id"));
                g.setDescription(cmd.getOptionValue("f"));
                patrolRequest = PatrolRequest.put(_rid, g);
                System.out.println(g.getId() + " " + _seed);
                break;
            case "perm":
                //System.err.println("perm built");
                perm = createPerm(g.getN(), new Random(Long.parseLong(cmd.getOptionValue("ps").trim())));
                patrolRequest = PatrolRequest.perm(_rid, perm);
                break;
            case "vc":
                //System.err.println("vc built");
                perm = createPerm(g.getN(), new Random(Long.parseLong(cmd.getOptionValue("ps").trim())));
                Set<Integer> isInIso = modifyVertices(decomposition.getMaxIS(), perm);
                Set<Integer> vc = IntStream.range(0, g.getN()).boxed().collect(Collectors.toSet());
                vc.removeAll(isInIso);
                patrolRequest = PatrolRequest.vc(_rid, vc.stream().mapToInt(Integer::intValue).toArray());
                break;
            case "iso":
                long _permSeed = System.nanoTime();
                perm = createPerm(g.getN(), new Random(_permSeed));
                iso = modifyGraph(g, perm);
                patrolRequest = PatrolRequest.iso(_rid, iso, cmd.getOptionValue("id"));
                System.out.println(_permSeed);
                break;
            default:
                throw new IllegalArgumentException();
        }

        new Gson().toJson(patrolRequest, writer);
        writer.flush();

    }

    private static Graph modifyGraph(Graph g, int[] perm) {
        Set<Graph.Edge> newEdges = new HashSet<>();
        for (Graph.Edge e: g.getEdges()) {
            newEdges.add(new Graph.Edge(perm[e.getV()], perm[e.getU()]));
        }
        long[] newW = new long[g.getN()];
        for (int i = 0; i < g.getN(); i++) {
            newW[perm[i]] = g.getWeight()[i];
        }
        Graph res = new Graph(g.getN(), newEdges, newW);
        res.setLimit(g.getLimit());
        return res;

    }

    private static Set<Integer> modifyVertices(Set<Integer> maxIS, int[] perm) {
        return maxIS.stream().map(x -> perm[x]).collect(Collectors.toSet());
    }

    private static int[] createPerm(int n, Random random) {
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            order.add(i);
        }
        Collections.shuffle(order, random);
        return order.stream().mapToInt(Integer::intValue).toArray();
    }
}
