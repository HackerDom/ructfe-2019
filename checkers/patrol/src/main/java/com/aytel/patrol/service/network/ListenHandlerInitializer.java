package com.aytel.patrol.service.network;

import com.aytel.patrol.service.config.Properties;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.ServerChannel;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;

public class ListenHandlerInitializer extends ChannelInitializer<SocketChannel> {
    private final Properties config;
    private static final int MAX_SIZE = 1024 * 1024;

    public ListenHandlerInitializer(Properties config) {
        this.config = config;
    }

    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline p = ch.pipeline();
        p.addLast(new HttpServerCodec());
        p.addLast(new HttpObjectAggregator(MAX_SIZE));
        p.addLast(new ListenThreadHandler(config));
    }
}
