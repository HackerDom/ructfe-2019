package com.aytel.patrol.service.network;

import com.aytel.patrol.service.config.Properties;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

import java.util.concurrent.ExecutionException;

public class ListenThreadRunnable implements Runnable {
    private final Properties config;

    public ListenThreadRunnable(Properties config) {
        this.config = config;
    }

    @Override
    public void run() {
        EventLoopGroup listenGroup = new NioEventLoopGroup(1);
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(listenGroup, config.workerLoopGroup)
                .channelFactory(NioServerSocketChannel::new)
                .childOption(ChannelOption.SO_KEEPALIVE, true)
                .childHandler(new ListenHandlerInitializer(config));
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            listenGroup.shutdownGracefully();
        }
    }
}
