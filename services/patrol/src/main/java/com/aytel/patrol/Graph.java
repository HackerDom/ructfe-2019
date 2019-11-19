package com.aytel.patrol;

import java.util.Set;

public class Graph {
    private final int n;
    private final Set<Edge> edges;
    private final long[] weight;
    private String id, description;
    private long limit;

    public Graph(int n, Set<Edge> edges, long[] weight) {
        this.n = n;
        this.edges = edges;
        this.weight = weight;
    }

    public Set<Edge> getEdges() {
        return edges;
    }

    public long[] getWeight() {
        return weight;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public long getLimit() {
        return limit;
    }

    public void setLimit(long limit) {
        this.limit = limit;
    }

    public int getN() {
        return n;
    }

    public static class Edge {
        private final int v, u;

        public Edge(int v, int u) {
            this.v = v;
            this.u = u;
        }

        public int getU() {
            return u;
        }

        public int getV() {
            return v;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof Edge) {
                var other = (Edge) obj;
                return (v == other.v && u == other.u) || (v == other.u && u == other.v);
            } else {
                return false;
            }
        }

        @Override
        public int hashCode() {
            return Set.of(v, u).hashCode();
        }
    }


}
