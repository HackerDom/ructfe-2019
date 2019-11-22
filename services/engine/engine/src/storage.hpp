#ifndef HPP_STORAGE
#define HPP_STORAGE

#include <vector>
#include <string>
#include <fstream>
#include <iostream>

#include <boost/optional.hpp>
#include <boost/filesystem.hpp>

#include "dumper.hpp"
#include "fuel/fuel.hpp"


template<class MyClass>
class storage {
public:
    static boost::optional<std::vector<std::string>> list() {
        std::vector<std::string> list;
        std::string path = get_path("");

        if (!boost::filesystem::exists(path)) {
            return boost::optional<std::vector<std::string>>();
        }

        for (auto& entry : boost::filesystem::directory_iterator(path)) {
            std::string filename = entry.path().filename().string();

            if (filename.at(0) == '.')
                continue;

            list.push_back(filename);
        }

        return boost::optional<std::vector<std::string>>(list);
    }

    static boost::optional<MyClass> load(std::string const name) {
        std::string path = get_path(name);

        std::ifstream ifs(path, std::ios::in | std::ios::binary);
        
        if (!ifs.is_open()) {
            return boost::optional<MyClass>();
        }

        boost::optional<MyClass> obj = dumper<MyClass>::load(ifs);
        
        ifs.close();

        return obj;
    }

    static boost::optional<std::string> save(MyClass const& obj) {
        std::string name = generate_name();
        std::string path = get_path(name);

        std::ofstream ofs(path, std::ios::out | std::ios::binary);

        if (!dumper<MyClass>::save(obj, ofs)) {
            return boost::optional<std::string>();
        }
        
        ofs.close();

        return boost::optional<std::string>(name);
    }

private:
    static std::string get_path(std::string const name) {
        return std::string("./data/") + name;
    }

    static std::string generate_name() {
        const size_t part_length = 5;
        const size_t parts_count = 4;

        std::string name;
        std::ifstream rnd("/dev/urandom", std::ios::in | std::ios::binary);

        for (size_t i = 0; i < parts_count; i++) {
            if (i > 0) {
                name.append(1, '-');
            }

            for (size_t k = 0; k < part_length; k++) {
                switch (rnd.get() % 2) {
                case 0:
                    name.append(1, 'a' + rnd.get() % 26);
                    break;
                case 1:
                    name.append(1, '0' + rnd.get() % 10);
                    break;
                }
            }
        }

        rnd.close();
        return name;
    }
};


#endif
