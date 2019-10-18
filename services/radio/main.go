package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
	"github.com/HackerDom/ructfe-2019/services/radio/routes"
)

func main() {
	waitTimeout := flag.Duration("graceful-timeout", time.Second*15, "The duration for which the server gracefully wait")
	addr := flag.String("addr", ":4553", "Address for binding service")
	flag.Parse()

	_, err := config.GetConfig()
	if err != nil {
		log.Fatalf("Can't get config, reason: %v", err)
	}
	r := routes.MakeRouter()

	server := &http.Server{
		Handler: r,
		Addr:    *addr,

		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	log.Printf("Server starts listening to addr %v", *addr)

	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	c := make(chan os.Signal, 1)

	signal.Notify(c, os.Interrupt)

	<-c

	ctx, cancel := context.WithTimeout(context.Background(), *waitTimeout)

	defer cancel()

	server.Shutdown(ctx)

	log.Println("Shutting down")
	os.Exit(0)
}
