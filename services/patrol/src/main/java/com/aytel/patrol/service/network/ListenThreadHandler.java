package com.aytel.patrol.service.network;

import com.aytel.patrol.Graph;
import com.aytel.patrol.PatrolRequest;
import com.aytel.patrol.PatrolResponse;
import com.aytel.patrol.service.config.Properties;
import com.google.gson.JsonSyntaxException;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.*;
import io.netty.util.ReferenceCountUtil;

import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ListenThreadHandler extends ChannelInboundHandlerAdapter {
    private final Properties config;
    private final Random random = new Random();

    public ListenThreadHandler(Properties config) {
        this.config = config;
    }

    private static void flushAndClose(Channel ch) {
        if (ch.isActive()) {
            ch.writeAndFlush(Unpooled.EMPTY_BUFFER).addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        FullHttpRequest request = null;
        if (!(msg instanceof FullHttpRequest)) {
            super.channelRead(ctx, msg);
            return;
        } else {
            request = (FullHttpRequest) msg;
        }
        String content = request.content().toString(Charset.defaultCharset());
        if (request.method() != HttpMethod.POST) {
            ctx.writeAndFlush(new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST));
            flushAndClose(ctx.channel());
        }
        try {
            PatrolRequest patrolRequest = config.readGson.fromJson(content, PatrolRequest.class);
            PatrolResponse patrolResponse = handle(patrolRequest, ctx);
            String json = config.gson.toJson(patrolResponse);
            FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,
                HttpResponseStatus.OK, Unpooled.copiedBuffer(json.getBytes()));
            ctx.channel().writeAndFlush(response);
            flushAndClose(ctx.channel());
        } catch (JsonSyntaxException e) {
            ctx.writeAndFlush(new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST));
            flushAndClose(ctx.channel());
        } finally {
            ReferenceCountUtil.release(msg);
        }
    }

    private PatrolResponse handle(PatrolRequest patrolRequest, ChannelHandlerContext ctx) {
        if (!check(patrolRequest)) {
            return PatrolResponse.failed(patrolRequest.reqId);
        }

        Graph graph;
        Properties.RequestInfo info;

        try {
            switch (patrolRequest.type) {
                case LIST:
                    return new PatrolResponse(config.getIds());
                case SEND_ISO:
                    boolean mode = random.nextBoolean();
                    info = config.getRequestInfo(patrolRequest.reqId);
                    if (info == null) {
                        return PatrolResponse.failed(patrolRequest.reqId);
                    }
                    info.setLastIso(patrolRequest.graph);
                    if (mode) {
                        return PatrolResponse.reqPerm(patrolRequest.reqId);
                    } else {
                        return PatrolResponse.reqVC(patrolRequest.reqId);
                    }
                case SEND_VC:
                    int[] vc = patrolRequest.vc;
                    info = config.getRequestInfo(patrolRequest.reqId);
                    graph = config.getGraph(info.getGraphId());
                    if (checkVC(info.getLastIso(), vc)) {
                        return getPatrolResponseIfSuccess(patrolRequest, graph, info);
                    } else {
                        config.removeRequestInfo(patrolRequest.reqId);
                        return PatrolResponse.failed(patrolRequest.reqId);
                    }
                case SEND_PERM:
                    int[] perm = patrolRequest.perm;
                    info = config.getRequestInfo(patrolRequest.reqId);
                    graph = config.getGraph(info.getGraphId());
                    if (checkPerm(graph, info.getLastIso(), perm)) {
                        return getPatrolResponseIfSuccess(patrolRequest, graph, info);
                    } else {
                        config.removeRequestInfo(patrolRequest.reqId);
                        return PatrolResponse.failed(patrolRequest.reqId);
                    }
                case GET_GRAPH:
                    info = config.getRequestInfo(patrolRequest.reqId);
                    if (info != null) {
                        return PatrolResponse.failed(patrolRequest.reqId);
                    }
                    config.createRequestInfo(patrolRequest.reqId, patrolRequest.graphId);
                    return PatrolResponse.graph(patrolRequest.reqId, config.getGraph(patrolRequest.graphId));
                case PUT_GRAPH:
                    if (config.hasGraph(patrolRequest.graph.getId())) {
                        return PatrolResponse.failed(patrolRequest.reqId);
                    } else {
                        config.putGraph(patrolRequest.graph);
                        return PatrolResponse.flag(patrolRequest.reqId, patrolRequest.graph.getDescription());
                    }
                default:
                    throw new RuntimeException();
            }
        } catch (Exception e) {
            return PatrolResponse.failed(patrolRequest.reqId);
        }
    }

    private PatrolResponse getPatrolResponseIfSuccess(PatrolRequest patrolRequest, Graph graph, Properties.RequestInfo info) {
        info.setRequestsLeft(info.getRequestsLeft() - 1);
        if (info.getRequestsLeft() == 0) {
            config.removeRequestInfo(patrolRequest.reqId);
            return PatrolResponse.flag(patrolRequest.reqId, graph.getDescription());
        } else {
            info.setLastTouch(System.currentTimeMillis());
            return PatrolResponse.next(patrolRequest.reqId);
        }
    }

    private boolean checkVC(Graph lastIso, int[] vc) {
        long limit = lastIso.getLimit();
        if (Arrays.stream(vc).mapToLong(i -> lastIso.getWeight()[i]).sum() > limit)
            return false;
        Set<Integer> vcSet = Arrays.stream(vc).boxed().collect(Collectors.toSet());
        Set<Integer> isSet = IntStream.range(0, lastIso.getN()).boxed().collect(Collectors.toSet());
        Map<Integer, Set<Integer>> adjList = new HashMap<>();
        IntStream.range(0, lastIso.getN()).forEach(i -> adjList.put(i, new HashSet<>()));
        for (Graph.Edge edge: lastIso.getEdges()) {
            int v = edge.getV(), u = edge.getU();

            adjList.get(v).add(u);
            adjList.get(u).add(v);
        }
        isSet.removeAll(vcSet);
        return dfsToCheckIS(0, isSet, adjList, new HashSet<>());
    }

    private boolean dfsToCheckIS(int v, Set<Integer> isSet, Map<Integer, Set<Integer>> adjList, Set<Integer> used) {
        if (used.contains(v))
            return true;
        used.add(v);
        for (int u: adjList.get(v)) {
            if (isSet.contains(v) && isSet.contains(u))
                return false;
            if (!dfsToCheckIS(u, isSet, adjList, used))
                return false;
        }
        return true;
    }

    private boolean checkPerm(Graph graph, Graph lastIso, int[] perm) {
        Set<Graph.Edge> firstEdges = lastIso.getEdges();
        Set<Graph.Edge> secondEdges = new HashSet<>();
        for (Graph.Edge edge: graph.getEdges()) {
            int v = edge.getV(), u = edge.getU();
            secondEdges.add(new Graph.Edge(perm[v], perm[u]));
        }
        return firstEdges.containsAll(secondEdges) && secondEdges.containsAll(firstEdges);
    }

    private boolean check(PatrolRequest patrolRequest) {
        switch (patrolRequest.type) {
            case LIST:
                return true;
            case SEND_ISO:
                return patrolRequest.reqId != null && patrolRequest.graphId != null && patrolRequest.graph != null;
            case SEND_PERM:
                return patrolRequest.reqId != null && patrolRequest.perm != null;
            case SEND_VC:
                return patrolRequest.reqId != null && patrolRequest.vc != null;
            case GET_GRAPH:
                return patrolRequest.reqId != null && patrolRequest.graphId != null;
            case PUT_GRAPH:
                return patrolRequest.reqId != null && patrolRequest.graphId != null && patrolRequest.graph != null;
            default:
                throw new RuntimeException();
        }
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        flushAndClose(ctx.channel());
    }
}
