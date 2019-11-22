#include <string>
#include <iostream>

#include "handler.hpp"


int main(int argc, char** argv, char** envp) {
    if (argc < 5) {
        std::cerr << "Usage: ./generator <flag> <case> <overlap> <partial>" << std::endl;
        std::cerr << "Example: ./generator AAAAA 0 1 1" << std::endl;
        return -1;
    }

    std::string flag = std::string(argv[1]);
    
    bool d_case = argv[2][0] == '1';
    bool d_overlap = argv[3][0] == '1';
    bool d_partial = argv[4][0] == '1';

    handler::generate_fuel(flag, d_case, d_overlap, d_partial);
    
    return 0;
}
