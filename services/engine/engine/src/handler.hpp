#ifndef HPP_HANDLER
#define HPP_HANDLER

#include <string>
#include <iostream>

#include <boost/optional.hpp>

#include "http.hpp"
#include "dumper.hpp"
#include "storage.hpp"
#include "fuel/fuel.hpp"


class handler {
public:
    static int list_fuel() {
        boost::optional<std::vector<std::string>> list = storage<fuel>::list();

        if (!list.is_initialized()) {
            return http::internal_server_error();
        }

        http::ok();

        for (auto f_name : list.get()) {
            std::cout << f_name << std::endl;
        }

        return 0;
    }

    static int upload_fuel() {
        boost::optional<fuel> f = dumper<fuel>::load(std::cin);

        if (!f.is_initialized()) {
            return http::bad_request();
        }

        boost::optional<std::string> name = storage<fuel>::save(f.get());

        if (!name.is_initialized()) {
            return http::internal_server_error();
        }

        http::ok();

        std::cout << name.get() << std::endl;

        return 0;
    }

    static int check_fuel() {
        char const* f_name = getenv("QUERY_STRING");
        char const* p_size_s = getenv("CONTENT_LENGTH");

        if (f_name == NULL || p_size_s == NULL) {
            return http::bad_request();
        }
        
        boost::optional<fuel> f = storage<fuel>::load(std::string(f_name));

        if (!f.is_initialized()) {
            return http::not_found();
        }

        size_t p_size = std::stoi(std::string(p_size_s));
        
        char buffer[p_size];
        std::cin.read(buffer, p_size);
        std::string property(buffer, buffer + p_size);

        try {
            auto result = f.get().check(property);

            http::ok();

            for (auto p : result) {
                std::cout << property.substr(p.start(), p.size()) << " " << "(" << p.start() << " -> " << p.end() << ")" << std::endl;
            }
        }
        catch (...) {
            return http::internal_server_error();
        }

        return 0;
    }
};


#endif
