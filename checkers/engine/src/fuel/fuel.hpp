#ifndef HPP_FUEL
#define HPP_FUEL

#include <boost/serialization/access.hpp>

#include <queue>
#include <vector>
#include <memory>
#include <algorithm>

#include "piece.hpp"
#include "state.hpp"
#include "settings.hpp"
#include "piece_tree.hpp"


class fuel {
private:
    state*       d_root;
    settings     d_settings;
    bool         d_build_failure;
    unsigned int d_num_keywords = 0;

public:
    fuel(): fuel(settings()) {}

    fuel(const settings& s)
        : d_root(new state())
        , d_settings(s)
        , d_build_failure(false) {}

    fuel& ignore_case() {
        d_settings.set_ignore_case(true);
        return *this;
    }

    fuel& without_overlaps() {
        d_settings.set_without_overlaps(true);
        return *this;
    }

    fuel& match_entire() {
        d_settings.set_match_entire(true);
        return *this;
    }

    void add(std::string keyword) {
        if (keyword.empty())
            return;

        state* cur_state = d_root;

        for (const auto& ch : keyword) {
            cur_state = cur_state->add(ch);
        }

        cur_state->add_piece(keyword.size(), d_num_keywords++);
        d_build_failure = false;
    }

    std::vector<piece> check(std::string text) {
        if (!d_build_failure) {
            build_failure();
        }

        size_t pos = 0;
        state* cur_state = d_root;
        std::vector<piece> collected_pieces;
        
        for (auto c : text) {
            if (d_settings.is_ignore_case()) {
                c = std::tolower(c);
            }

            cur_state = find_state(cur_state, c);
            store_piece(pos, cur_state, collected_pieces);
            pos++;
        }

        if (d_settings.is_match_entire()) {
            delete_partial_matches(text, collected_pieces);
        }

        if (d_settings.is_without_overlaps()) {
            piece_tree tree(std::vector<piece>(collected_pieces.begin(), collected_pieces.end()));
            auto tmp = tree.delete_overlaps(collected_pieces);
            collected_pieces.swap(tmp);
        }

        return std::vector<piece>(collected_pieces);
    }

private:
    void delete_partial_matches(std::string& search_text, std::vector<piece>& collected_pieces) const {
        size_t size = search_text.size();
        std::vector<piece> remove_pieces;
        
        for (const auto& p : collected_pieces) {
            if ((p.start() == 0 || !std::isalpha(search_text.at(p.start() - 1))) &&
                (p.end() + 1 == size || !std::isalpha(search_text.at(p.end() + 1)))) {
                continue;
            }

            remove_pieces.push_back(p);
        }
        for (auto& p : remove_pieces) {
            collected_pieces.erase(
                std::find(collected_pieces.begin(), collected_pieces.end(), p)
            );
        }
    }

    state* find_state(state* cur_state, char c) const {
        state* result = cur_state->next(c);
        
        while (result == nullptr) {
            cur_state = cur_state->failure();
            result = cur_state->next(c);
        }
        
        return result;
    }

    void build_failure() {
        std::queue<state*> q;

        for (auto& depth_one_state : d_root->states()) {
            depth_one_state->failure(d_root);
            q.push(depth_one_state);
        }
        
        d_build_failure = true;

        while (!q.empty()) {
            auto cur_state = q.front();
            
            for (const auto& transition : cur_state->transitions()) {
                state* target_state = cur_state->next(transition);
                q.push(target_state);

                state* trace_failure_state = cur_state->failure();
                while (trace_failure_state->next(transition) == nullptr) {
                    trace_failure_state = trace_failure_state->failure();
                }

                state* new_failure_state = trace_failure_state->next(transition);
                target_state->failure(new_failure_state);
                target_state->add_piece(new_failure_state->pieces());
            }

            q.pop();
        }
    }

    void store_piece(size_t pos, state* cur_state, std::vector<piece>& collected_pieces) const {
        auto pieces = cur_state->pieces();
        
        if (!pieces.empty()) {
            for (const auto& str : pieces) {
                collected_pieces.push_back(piece(pos - str.first + 1, pos, str.second));
            }
        }
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_root;
        ar & d_settings;
        ar & d_build_failure;
        ar & d_num_keywords;
    }
};


#endif
