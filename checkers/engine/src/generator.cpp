#include <string>
#include <iostream>

#include "handler.hpp"


int main(int argc, char** argv, char** envp) {
    if (argc < 2) {
        std::cerr << "Need 1 or more arguments." << std::endl;
        return -1;
    }

    std::string flag = std::string(argv[1]);

    handler::generate_fuel(flag);
    
    return 0;
}
