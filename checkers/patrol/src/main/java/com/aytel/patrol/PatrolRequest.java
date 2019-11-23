package com.aytel.patrol;

public class PatrolRequest {
    public Type type;
    public String graphId, reqId;
    public int[] perm, vc;
    public Graph graph;

    public static PatrolRequest put(String rid, Graph g) {
        PatrolRequest patrolRequest = new PatrolRequest();
        patrolRequest.type = Type.PUT_GRAPH;
        patrolRequest.reqId = rid;
        patrolRequest.graph = g;
        patrolRequest.graphId = g.getId();
        return patrolRequest;
    }

    public static PatrolRequest perm(String rid, int[] perm) {
        PatrolRequest patrolRequest = new PatrolRequest();
        patrolRequest.type = Type.SEND_PERM;
        patrolRequest.reqId = rid;
        patrolRequest.perm = perm;
        return patrolRequest;
    }

    public static PatrolRequest vc(String rid, int[] vc) {
        PatrolRequest patrolRequest = new PatrolRequest();
        patrolRequest.type = Type.SEND_VC;
        patrolRequest.reqId = rid;
        patrolRequest.vc = vc;
        return patrolRequest;
    }

    public static PatrolRequest iso(String rid, Graph iso, String graphId) {
        PatrolRequest patrolRequest = new PatrolRequest();
        patrolRequest.type = Type.SEND_ISO;
        patrolRequest.reqId = rid;
        patrolRequest.graph = iso;
        patrolRequest.graphId = graphId;
        return patrolRequest;
    }

    public static PatrolRequest defaultVC(String rid, Graph g, String graphId) {
        PatrolRequest patrolRequest = new PatrolRequest();
        patrolRequest.reqId = rid;
        patrolRequest.graph = g;
        patrolRequest.graphId = graphId;
        return patrolRequest;
    }

    public enum Type {
        LIST, SEND_ISO, SEND_PERM, SEND_VC, GET_GRAPH, PUT_GRAPH
    }
}
