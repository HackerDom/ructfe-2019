#ifndef HPP_STATE
#define HPP_STATE

#include <boost/serialization/access.hpp>
#include <boost/serialization/set.hpp>
#include <boost/serialization/map.hpp>

#include <set>
#include <map>
#include <vector>
#include <utility>


class state {
private:
    size_t                                          d_depth;
    state*                                          d_root;
    std::map<char, state*>                          d_success;
    state*                                          d_failure;
    std::set<std::pair<unsigned int, unsigned int>> d_pieces;

public:
    state(): state(0) {}

    explicit state(size_t depth)
        : d_depth(depth)
        , d_root(depth == 0 ? this : nullptr)
        , d_success()
        , d_failure(nullptr)
        , d_pieces() {}

    state* next(char character) const {
        return next(character, false);
    }

    state* next_without_root(char character) const {
        return next(character, true);
    }

    state* add(char character) {
        auto next = next_without_root(character);

        if (next == nullptr) {
            next = new state(d_depth + 1);
            d_success[character] = next;
        }
        
        return next;
    }

    size_t depth() const { 
        return d_depth; 
    }

    void add_piece(unsigned int size, unsigned int index) {
        d_pieces.insert(std::make_pair(size, index));
    }

    void add_piece(const std::set<std::pair<unsigned int, unsigned int>>& pieces) {
        for (const auto& p : pieces) {
            add_piece(p.first, p.second);
        }
    }

    std::set<std::pair<unsigned int, unsigned int>> pieces() const { 
        return d_pieces; 
    }

    state* failure() const { 
        return d_failure; 
    }

    void failure(state* fail_state) { 
        d_failure = fail_state; 
    }

    std::vector<state*> states() const {
        std::vector<state*> result;
        
        for (auto it = d_success.cbegin(); it != d_success.cend(); ++it) {
            result.push_back(it->second);
        }
        
        return std::vector<state*>(result);
    }

    std::vector<char> transitions() const {
        std::vector<char> result;
        
        for (auto it = d_success.cbegin(); it != d_success.cend(); ++it) {
            result.push_back(it->first);
        }
        
        return std::vector<char>(result);
    }

private:
    state* next(char character, bool ignore_root_state) const {
        state* result = nullptr;
        auto found = d_success.find(character);
        
        if (found != d_success.end()) {
            result = found->second;
        } 
        else if (!ignore_root_state && d_root != nullptr) {
            result = d_root;
        }
        
        return result;
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_depth;
        ar & d_root;
        ar & d_success;
        ar & d_failure;
        ar & d_pieces;
    }
};


#endif
