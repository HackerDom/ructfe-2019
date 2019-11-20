build:
	yarn install
	yarn build
	mkdir -p .build
	cp -r ./static ./.build
	cp -r ./views ./.build
	cp config.yaml.example ./.build/config.yaml
	GOOS=linux GOARCH=amd64 go build -mod vendor -buildmode=plugin -v -a -o ./.build/radio-auth.so plugins/auth/auth.go
	GOOS=linux GOARCH=amd64 go build -mod vendor -v -a -o ./.build/radio .

build-dev:
	GOOS=linux GOARCH=amd64 go build -buildmode=plugin -v -a -o radio-auth.so plugins/auth/auth.go
