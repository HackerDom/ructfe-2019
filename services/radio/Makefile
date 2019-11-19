build:
	mkdir -p .build
	cp -r ./static ./.build
	cp -r ./views ./.build
	GOOS=linux GOARCH=amd64 go build -buildmode=plugin -v -a -o ./.build/radio-auth.so plugins/auth/auth.go
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -v -a -o ./.build/radio .

build-dev:
	GOOS=linux GOARCH=amd64 go build -buildmode=plugin -v -a -o radio-auth.so plugins/auth/auth.go
	go run main.go
