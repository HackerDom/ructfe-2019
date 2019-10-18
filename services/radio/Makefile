build:
	mkdir -p .build
	cp -r ./static ./.build
	cp -r ./views ./.build
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -v -a -o ./.build/radio .
