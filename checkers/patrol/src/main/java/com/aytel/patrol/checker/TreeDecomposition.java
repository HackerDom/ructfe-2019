package com.aytel.patrol.checker;

import com.aytel.patrol.Graph;

import java.util.*;
import java.util.function.Consumer;

import static java.lang.Long.max;

public class TreeDecomposition {
    private Node root;
    private Graph g;

    private TreeDecomposition() {}

    public static TreeDecomposition generate(Random random, int vertices, int w) {
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < vertices; i++) {
            order.add(i);
        }
        Collections.shuffle(order, random);
        var iter = order.iterator();

        var result = new TreeDecomposition();
        int v = iter.next();
        result.root = new Forget(new HashSet<>(), v,
            dfs(order, iter, new HashSet<>(Set.of(v)), random, 0, w));
        assert(!iter.hasNext());
        return result;
    }

    private static Node dfs(List<Integer> order, Iterator<Integer> iter,
                            Set<Integer> cur, Random random, int splitted, int w) {
        int mode = random.nextInt(4);
        int cnt = 0;
        while (!isValid(iter, cur, mode, splitted, w)) {
            mode = random.nextInt(4);
            if (cnt++ > 500) {
                System.err.println("Excuse me wtf");
            }
        }
        int v = -1;
        Set<Integer> old;
        switch (mode) {
            case 0:
                return new Leaf(new HashSet<>(cur));
            case 1:
                old = new HashSet<>(cur);
                int del = random.nextInt(cur.size()) + 1;
                var curIter = cur.iterator();
                for (int i = 0; i < del; i++)
                    v = curIter.next();
                curIter.remove();
                return new Introduce(old, v, dfs(order, iter, cur, random, splitted, w));
            case 2:
                old = new HashSet<>(cur);
                v = iter.next();
                cur.add(v);
                return new Forget(old, v, dfs(order, iter, cur, random, splitted, w));
            default:
                Set<Integer> copy = new HashSet<>(cur);
                return new Join(
                    new HashSet<>(cur),
                    dfs(order, iter, copy, random, splitted + 1, w),
                    dfs(order, iter, cur, random, splitted, w)
                );
        }
    }

    private static boolean isValid(Iterator<Integer> iter, Set<Integer> cur, int mode, int splitted, int w) {
        switch (mode) {
            case 0:
                return cur.size() == 1 && (splitted > 0 || !iter.hasNext());
            case 1:
                return cur.size() > 1;
            case 2:
                return iter.hasNext() && cur.size() < w;
            default:
                return iter.hasNext();
        }
    }

    public void apply(Consumer<Node> function) {
        this.root.apply(function);
    }

    public long maxIS() {
        return Arrays.stream(root.maxIS(g.getEdges(), g.getWeight()).w).max().orElseThrow();
    }

    public Set<Integer> getMaxIS() {
        long best = -1;
        int mask = 0;
        //Info info = root.maxIS(g.getEdges(), g.getWeight());
        for (int curMask = 0; mask < (1 << root.vertices.size()); mask++) {
            long curValue = root.get(root.toSet(curMask));
            if (best < curValue) {
                mask = curMask;
                best = curValue;
            }
        }
        return root.getMaxIS(mask);
    }

    public Graph getG() {
        return g;
    }

    public void setG(Graph g) {
        this.g = g;
    }

    private static class Info {
        Map<Set<Integer>, Integer> map;
        long[] w;

        public Info(Map<Set<Integer>, Integer> map, long[] w) {
            this.map = map;
            this.w = w;
        }
    }

    public static abstract class Node {
        private final Set<Integer> vertices;
        private final int[] verticesArray;
        protected Info info = null;

        Node(Set<Integer> vertices) {
            this.vertices = vertices;
            this.verticesArray = new int[vertices.size()];
            int pn = 0;
            for (int x: vertices)
                verticesArray[pn++] = x;
        }

        public Set<Integer> getVertices() {
            return vertices;
        }

        abstract void apply(Consumer<Node> function);

        abstract Info maxIS(Set<Graph.Edge> edges, long[] weight);

        long get(Set<Integer> set) {
            try {
                return info.w[info.map.get(set)];
            } catch (Exception e) {
                System.err.println("Hmm....");
                throw e;
            }
        }

        Set<Integer> toSet(int mask) {
            Set<Integer> res = new HashSet<>();
            for (int i = 0; i < verticesArray.length; i++) {
                if ((mask & (1 << i)) != 0)
                    res.add(verticesArray[i]);
            }
            return res;
        }

        abstract Set<Integer> getMaxIS(int mask);
    }

    private static class Leaf extends Node {
        public Leaf(Set<Integer> vertices) {
            super(vertices);
        }

        void apply(Consumer<Node> function) {
            function.accept(this);
        }

        @Override
        Info maxIS(Set<Graph.Edge> edges, long[] weight) {
            int v = super.vertices.iterator().next();
            Map<Set<Integer>, Integer> map = Map.of(
                Collections.emptySet(), 0,
                Set.of(v), 1
            );
            long[] w = List.of(0L, weight[v]).stream().mapToLong(x -> x).toArray();
            return this.info = new Info(map, w);
        }

        @Override
        Set<Integer> getMaxIS(int mask) {
            int v = super.vertices.iterator().next();
            return (mask == 0 ? new HashSet<>() : new HashSet<>(Set.of(v)));
        }
    }

    private static class Introduce extends Node {
        private final int v;
        private final Node son;

        public Introduce(Set<Integer> vertices, int v, Node son) {
            super(vertices);
            this.v = v;
            this.son = son;
        }

        void apply(Consumer<Node> function) {
            function.accept(this);
            son.apply(function);
        }

        @Override
        Info maxIS(Set<Graph.Edge> edges, long[] weight) {
            son.maxIS(edges, weight);
            this.info = new Info(new HashMap<>(), new long[1 << getVertices().size()]);
            for (int mask = 0; mask < (1 << getVertices().size()); mask++) {
                Set<Integer> s = toSet(mask);
                this.info.map.put(s, mask);
                if (!s.contains(v)) {
                    this.info.w[mask] = son.get(s);
                } else {
                    boolean hasNeighbor = false;
                    for (int u: s) {
                        if (v != u && edges.contains(new Graph.Edge(v, u)))
                            hasNeighbor = true;
                    }
                    if (!hasNeighbor) {
                        Set<Integer> copy = new HashSet<>(s);
                        copy.remove(v);
                        this.info.w[mask] = son.get(copy) + weight[v];
                    } else {
                        this.info.w[mask] = -1;
                    }
                }
            }
            return this.info;
        }

        @Override
        Set<Integer> getMaxIS(int mask) {
            Set<Integer> s = toSet(mask);
            if (!s.contains(v)) {
                return son.getMaxIS(son.info.map.get(s));
            } else {
                s.remove(v);
                Set<Integer> result = son.getMaxIS(son.info.map.get(s));
                result.add(v);
                return result;
            }
        }
    }

    private static class Forget extends Node {
        private final int v;
        private final Node son;

        public Forget(Set<Integer> vertices, int v, Node son) {
            super(vertices);
            this.v = v;
            this.son = son;
        }

        void apply(Consumer<Node> function) {
            function.accept(this);
            son.apply(function);
        }

        @Override
        Info maxIS(Set<Graph.Edge> edges, long[] weight) {
            son.maxIS(edges, weight);
            this.info = new Info(new HashMap<>(), new long[1 << getVertices().size()]);
            for (int mask = 0; mask < (1 << getVertices().size()); mask++) {
                Set<Integer> s = toSet(mask);
                this.info.map.put(s, mask);
                this.info.w[mask] = son.get(s);
                Set<Integer> copy = new HashSet<>(s);
                copy.add(v);
                this.info.w[mask] = max(this.info.w[mask], son.get(copy));
            }
            return this.info;
        }

        @Override
        Set<Integer> getMaxIS(int mask) {
            Set<Integer> s1 = toSet(mask);
            Set<Integer> s2 = toSet(mask);
            s2.add(v);
            if (son.get(s2) > son.get(s1)) {
                return son.getMaxIS(son.info.map.get(s2));
            } else {
                return son.getMaxIS(son.info.map.get(s1));
            }
        }

    }

    private static class Join extends Node {
        private final Node l, r;

        public Join(Set<Integer> vertices, Node l, Node r) {
            super(vertices);
            this.l = l;
            this.r = r;
        }

        void apply(Consumer<Node> function) {
            function.accept(this);
            l.apply(function);
            r.apply(function);
        }

        @Override
        Info maxIS(Set<Graph.Edge> edges, long[] weight) {
            l.maxIS(edges, weight);
            r.maxIS(edges, weight);
            this.info = new Info(new HashMap<>(), new long[1 << getVertices().size()]);
            for (int mask = 0; mask < (1 << getVertices().size()); mask++) {
                Set<Integer> s = toSet(mask);
                this.info.map.put(s, mask);
                long wl = l.get(s);
                long wr = r.get(s);
                if (wl != -1 && wr != -1) {
                    long cur = 0;
                    for (int v: s)
                        cur += weight[v];
                    this.info.w[mask] = wl + wr - cur;
                } else {
                    this.info.w[mask] = -1;
                }
            }
            return this.info;
        }

        @Override
        Set<Integer> getMaxIS(int mask) {
            Set<Integer> s = toSet(mask);
            Set<Integer> result1 = l.getMaxIS(l.info.map.get(s));
            Set<Integer> result2 = r.getMaxIS(l.info.map.get(s));

            if (result1.size() < result2.size()) {
                result2.addAll(result1);
                return result2;
            } else {
                result1.addAll(result2);
                return result1;
            }
        }
    }
}