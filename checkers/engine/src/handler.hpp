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
        srand(time(NULL));

        FILE* random = fopen("/dev/urandom", "rb");
    
        if (random == NULL) {
            std::cerr << "Error while opening /dev/urandom." << std::endl;
            return;
        }

        char buffer[WORD_LENGTH];
        
        fuel f;

        size_t i, k;

        for (i = 0; i < flag.length() - 1; i++) {
            buffer[i] = flag.at(i);

            fread(buffer + i, sizeof(char), WORD_LENGTH - i, random);
            
            f.add(std::string(buffer));
        }

        for (i = 0; i < WORDS_COUNT; i++) {
            fread(buffer, sizeof(char), WORD_LENGTH, random);

            for (k = 0; k < WORD_LENGTH; k++) {
                if (rand() % 64) {
                    buffer[i] = 'A' + ((unsigned char)buffer[i]) % 26;
                }
                else {
                    buffer[i] = '0' + ((unsigned char)buffer[i]) % 10;
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
