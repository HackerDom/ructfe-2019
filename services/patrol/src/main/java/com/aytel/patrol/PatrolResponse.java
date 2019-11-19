package com.aytel.patrol;

public class PatrolResponse {
    public Type type;
    public String[] ids;
    public Graph graph;
    public String flag;
    public String graphId, reqId;

    private PatrolResponse() {}

    public PatrolResponse(String[] ids) {
        this.ids = ids;
        this.type = Type.LIST;
    }

    public static PatrolResponse failed(String reqId) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.FAILED;
        return patrolResponse;
    }

    public static PatrolResponse flag(String reqId, String description) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.OK;
        patrolResponse.flag = description;
        return patrolResponse;
    }

    public static PatrolResponse next(String reqId) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.CONTINUE;
        return patrolResponse;
    }

    public static PatrolResponse graph(String reqId, Graph graph) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.GRAPH;
        patrolResponse.graph = graph;
        return patrolResponse;
    }

    public static PatrolResponse reqPerm(String reqId) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.REQ_PERM;
        return patrolResponse;
    }

    public static PatrolResponse reqVC(String reqId) {
        PatrolResponse patrolResponse = new PatrolResponse();
        patrolResponse.reqId = reqId;
        patrolResponse.type = Type.REQ_VC;
        return patrolResponse;
    }

    public enum Type {
        OK, FAILED, REQ_PERM, REQ_VC, LIST, GRAPH, CONTINUE
    }
}
