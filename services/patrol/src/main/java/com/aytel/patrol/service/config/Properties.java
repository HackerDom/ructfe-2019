package com.aytel.patrol.service.config;

import com.aytel.patrol.Graph;
import com.aytel.patrol.service.util.ExcludeDescriptionStategy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

public class Properties {
    public final int listenPort;
    public final EventLoopGroup workerLoopGroup;
    public final int storageSize;
    public final String storagePath;
    Map<String, String> map = new HashMap<>();
    Map<String, RequestInfo> info = new HashMap<>();
    public final Gson gson = new GsonBuilder().setExclusionStrategies(new ExcludeDescriptionStategy()).create();
    public final Gson readGson = new GsonBuilder().create();
    private AtomicInteger counter = new AtomicInteger(0);
    private final int requestPoolSize = 10000;

    public Properties(String path) {
        java.util.Properties config = new java.util.Properties();
        if (Files.exists(Paths.get(path))) {
            try {
                InputStream in = new FileInputStream(path);
                config.load(in);
            } catch (IOException | NullPointerException e) {
                throw new ExceptionInInitializerError(e);
            }
        }

        listenPort = Integer.parseInt(config.getProperty("listen_port", "23179"));
        workerLoopGroup = new NioEventLoopGroup(Runtime.getRuntime().availableProcessors());
        storageSize = Integer.parseInt(config.getProperty("storage_size", "5"));
        String almostStoragePath = config.getProperty("storage_path", "./storage/");
        if (almostStoragePath.charAt(almostStoragePath.length() - 1) != '/')
            almostStoragePath += "/";
        storagePath = almostStoragePath;
        
        makeIndexes();
    }

    private void makeIndexes() {
        File dir = new File(storagePath);
        File[] files = dir.listFiles();
        if (files == null) {
            throw new ExceptionInInitializerError();
        }
        for (File file: files) {
            try {
                Graph graph = readGson.fromJson(new FileReader(file), Graph.class);
                map.put(graph.getId(), file.getName());
            } catch (FileNotFoundException | JsonSyntaxException e) {
                throw new ExceptionInInitializerError();
            }
        }

        counter.set(0);
        while (Files.exists(Path.of(storagePath + counter.get() + ".json"))) {
            counter.updateAndGet(x -> (x + 1));
        }
        counter.updateAndGet(x -> (x + 1) % storageSize);
    }

    public String[] getIds() {
        Set<Map.Entry<String, String>> set = new HashSet<>(map.entrySet());
        String[] res = new String[set.size()];
        int pt = 0;
        for (Map.Entry<String, String> entry: set) {
            res[pt++] = entry.getKey();
        }
        return res;
    }

    public Graph getGraph(String graphId) throws FileNotFoundException {
        return readGson.fromJson(new FileReader(new File(storagePath + map.get(graphId))), Graph.class);
    }

    public RequestInfo getRequestInfo(String reqId) {
        return info.get(reqId);
    }

    public void removeRequestInfo(String reqId) {
        info.remove(reqId);
    }

    private void clear() {
        var requests = new HashSet<>(info.entrySet());
        for (Map.Entry<String, RequestInfo> entry: requests) {
            if (entry.getValue().lastTouch < System.currentTimeMillis() - 1000 * 60 * 5) {
                info.remove(entry.getKey());
            }
        }
    }

    public void createRequestInfo(String reqId, String graphId) {
        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setGraphId(graphId);
        info.put(reqId, requestInfo);
        if (info.size() > requestPoolSize)
            clear();
    }

    public boolean hasGraph(String id) {
        return map.containsKey(id);
    }

    public void putGraph(Graph graph) throws IOException {
        int fileNum = counter.getAndUpdate(x -> (x + 1) % storageSize);
        File file = new File(storagePath + fileNum + ".json");
        map.put(graph.getId(), file.getName());
        FileWriter writer = new FileWriter(file);
        writer.write(readGson.toJson(graph));
        writer.flush();
    }

    public static class RequestInfo {
        private int requestsLeft = 30;
        private String graphId;
        private Graph lastIso;
        private long lastTouch = System.currentTimeMillis();

        public void setLastTouch(long lastTouch) {
            this.lastTouch = lastTouch;
        }

        public int getRequestsLeft() {
            return requestsLeft;
        }

        public void setRequestsLeft(int requestsLeft) {
            this.requestsLeft = requestsLeft;
        }

        public String getGraphId() {
            return graphId;
        }

        public void setGraphId(String graphId) {
            this.graphId = graphId;
        }

        public Graph getLastIso() {
            return lastIso;
        }

        public void setLastIso(Graph lastIso) {
            this.lastIso = lastIso;
        }
    }
}
