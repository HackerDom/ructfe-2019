#ifndef HPP_PIECE_NODE
#define HPP_PIECE_NODE

#include <boost/serialization/access.hpp>

#include <vector>
#include <limits>
#include <utility>

#include "piece.hpp"

 
class piece_node {
    enum direction {
        LEFT, RIGHT
    };

    size_t             d_point;
    piece_node*        d_left;
    piece_node*        d_right;
    std::vector<piece> d_pieces;

public:
    explicit piece_node(const std::vector<piece>& pieces)
        : d_point(0)
        , d_left(nullptr)
        , d_right(nullptr)
        , d_pieces()
    {
        d_point = median(pieces);
        std::vector<piece> to_left, to_right;

        for (const auto& p : pieces) {
            if (p.end() < d_point) {
                to_left.push_back(p);
            } 
            else if (p.start() > d_point) {
                to_right.push_back(p);
            } 
            else {
                d_pieces.push_back(p);
            }
        }

        if (to_left.size() > 0) {
            d_left = new piece_node(to_left);
        }
        if (to_right.size() > 0) {
            d_right = new piece_node(to_right);
        }
    }

    size_t median(const std::vector<piece>& pieces) const {
        auto start = std::numeric_limits<size_t>::max();
        auto end   = std::numeric_limits<size_t>::max();

        for (const auto& p : pieces) {
            auto cur_start = p.start();
            auto cur_end = p.end();
            
            if (start == std::numeric_limits<size_t>::max() || cur_start < start) {
                start = cur_start;
            }
            if (end == std::numeric_limits<size_t>::max() || cur_end > end) {
                end = cur_end;
            }
        }

        return (start + end) / 2;
    }

    std::vector<piece> overlaps(const piece& p) {
        std::vector<piece> overlaps;

        if (d_point < p.start()) {
            add_overlaps(p, overlaps, find_node_overlaps(d_right, p));
            add_overlaps(p, overlaps, overlaps_right(p));
        } 
        else if (d_point > p.end()) {
            add_overlaps(p, overlaps, find_node_overlaps(d_left, p));
            add_overlaps(p, overlaps, overlaps_left(p));
        } 
        else {
            add_overlaps(p, overlaps, d_pieces);
            add_overlaps(p, overlaps, find_node_overlaps(d_left, p));
            add_overlaps(p, overlaps, find_node_overlaps(d_right, p));
        }
        
        return std::vector<piece>(overlaps);
    }

protected:
    void add_overlaps(const piece& p, std::vector<piece>& overlaps, std::vector<piece> new_overlaps) const {
        for (const auto& cur : new_overlaps) {
            if (cur != p) {
                overlaps.push_back(cur);
            }
        }
    }

    std::vector<piece> overlaps_left(const piece& p) const {
        return std::vector<piece>(overlaps_direction(p, LEFT));
    }

    std::vector<piece> overlaps_right(const piece& p) const {
        return std::vector<piece>(overlaps_direction(p, RIGHT));
    }

    std::vector<piece> overlaps_direction(const piece& p, direction d) const {
        std::vector<piece> overlaps;
        
        for (const auto& cur : d_pieces) {
            switch (d) {
                case LEFT:
                    if (cur.start() <= p.end()) {
                        overlaps.push_back(cur);
                    }
                    break;

                case RIGHT:
                    if (cur.end() >= p.start()) {
                        overlaps.push_back(cur);
                    }
                    break;
            }
        }

        return std::vector<piece>(overlaps);
    }

    std::vector<piece> find_node_overlaps(piece_node* piece_node, const piece& p) const {
        if (piece_node) {
            return std::vector<piece>(piece_node->overlaps(p));
        }

        return std::vector<piece>();
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_point;
        ar & d_left;
        ar & d_right;
        ar & d_pieces;
    }
};


#endif
