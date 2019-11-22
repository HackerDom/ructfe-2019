#ifndef HPP_HANDLER
#define HPP_HANDLER

#include <string>
#include <iostream>

#include "dumper.hpp"
#include "fuel/fuel.hpp"

#define WORD_LENGTH 32
#define WORDS_COUNT 32


class handler {
public:
    static void generate_fuel(std::string const flag) {
        FILE* random = fopen("/dev/urandom", "rb");
    
        if (random == NULL) {
            std::cerr << "Error while opening /dev/urandom." << std::endl;
            return;
        }

        char buffer[WORD_LENGTH];
        
        fuel f;

        for (size_t i = 0; i < WORDS_COUNT; i++) {
            fread(buffer, sizeof(char), WORD_LENGTH, random);

            for (size_t k = 0; k < WORD_LENGTH; k++) {
                if (fgetc(random) % 3 > 0) {
                    buffer[k] = 'A' + ((unsigned char)buffer[k]) % 26;
                }
                else {
                    buffer[k] = '0' + ((unsigned char)buffer[k]) % 10;
                }
            }

            f.add(std::string(buffer));
        }

        f.add(flag);

        fclose(random);

        dumper<fuel>::save(f, std::cout);
    }
};


#endif
