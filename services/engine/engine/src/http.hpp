#ifndef HPP_HTTP
#define HPP_HTTP

#include <iostream>


class http {
public:
    static int ok() {
        std::cout << "Content-Type: text/plain" << std::endl;
        std::cout << "Status: 200 OK" << std::endl << std::endl;

        return 0;
    }

    static int bad_request() {
        std::cout << "Content-Type: text/plain" << std::endl;
        std::cout << "Status: 400 Bad Request" << std::endl << std::endl;

        std::cout << "Bad request." << std::endl;

        return -1;
    }

    static int not_found() {
        std::cout << "Content-Type: text/plain" << std::endl;
        std::cout << "Status: 404 Not Found" << std::endl << std::endl;

        std::cout << "Not found." << std::endl;

        return -1;
    }

    static int method_not_allowed() {
        std::cout << "Content-Type: text/plain" << std::endl;
        std::cout << "Status: 405 Method Not Allowed" << std::endl << std::endl;

        std::cout << "Method not allowed." << std::endl;

        return -1;
    }

    static int internal_server_error() {
        std::cout << "Content-Type: text/plain" << std::endl;
        std::cout << "Status: 500 Internal Server Error" << std::endl << std::endl;

        std::cout << "Internal server error." << std::endl;

        return -2;
    }
};


#endif
