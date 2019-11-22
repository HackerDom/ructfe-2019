#include <string>
#include <iostream>

#include "http.hpp"
#include "handler.hpp"


int main(int argc, char** argv, char** envp) {
    std::string document_uri(getenv("DOCUMENT_URI"));
    std::string request_method(getenv("REQUEST_METHOD"));

    if (document_uri == "/api/ping/") {
        http::ok();

        std::cout << "Working." << std::endl;

        return 0;
    }

    if (document_uri == "/api/list/") {
        if (request_method != "GET") {
            return http::method_not_allowed();
        }

        return handler::list_fuel();
    }

    if (document_uri == "/api/upload/") {
        if (request_method != "POST") {
            return http::method_not_allowed();
        }

        return handler::upload_fuel();
    }

    if (document_uri == "/api/check/") {
        if (request_method != "POST") {
            return http::method_not_allowed();
        }

        return handler::check_fuel();
    }

    return http::not_found();
}
