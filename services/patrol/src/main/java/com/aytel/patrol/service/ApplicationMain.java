package com.aytel.patrol.service;

import com.aytel.patrol.service.config.Properties;
import com.aytel.patrol.service.network.ListenThreadRunnable;

import java.nio.file.Paths;

public class ApplicationMain {
    private static final String PROPERTY_PATH;

    static {
        PROPERTY_PATH = System.getProperty("properties",
            Paths.get(Paths.get("").toAbsolutePath().toString(), "patrol.properties").toString());
    }

    private ApplicationMain() {
    }

    public static void main(String[] args) throws Exception {
        Properties config = new Properties(PROPERTY_PATH);

        Thread listenThread = new Thread(new ListenThreadRunnable(config));
        listenThread.start();
        listenThread.join();
    }
}
