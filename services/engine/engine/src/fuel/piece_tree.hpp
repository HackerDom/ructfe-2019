#ifndef HPP_PIECE_TREE
#define HPP_PIECE_TREE

#include <boost/serialization/access.hpp>

#include <set>
#include <vector>
#include <algorithm>

#include "piece.hpp"
#include "piece_node.hpp"


class piece_tree {
private:
    piece_node d_root;

public:
    explicit piece_tree(const std::vector<piece>& pieces)
        : d_root(pieces) {}

    std::vector<piece> delete_overlaps(const std::vector<piece>& pieces) {
        std::vector<piece> result(pieces.begin(), pieces.end());

        std::sort(result.begin(), result.end(), [](const piece& a, const piece& b) -> bool {
            if (b.size() - a.size() == 0) {
                return a.start() > b.start();
            }

            return a.size() > b.size();
        });

        std::set<piece> remove_tmp;

        for (const auto& p : result) {
            if (remove_tmp.find(p) != remove_tmp.end()) {
                continue;
            }

            auto overlaps = d_root.overlaps(p);
            
            for (const auto& overlap : overlaps) {
                remove_tmp.insert(overlap);
            }
        }

        for (const auto& p : remove_tmp) {
            result.erase(
                std::find(result.begin(), result.end(), p)
            );
        }

        std::sort(result.begin(), result.end(), [](const piece& a, const piece& b) -> bool {
            return a.start() < b.start();
        });

        return std::vector<piece>(result);
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_root;
    }
};


#endif
