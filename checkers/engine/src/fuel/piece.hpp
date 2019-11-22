#ifndef HPP_PIECE
#define HPP_PIECE

#include <boost/serialization/access.hpp>


class piece {
private:
    size_t       d_start;
    size_t       d_end;
    unsigned int d_index;

public:
    piece()
        : d_start(-1)
        , d_end(-1)
        , d_index(0) {}

    piece(size_t start, size_t end, unsigned int index)
        : d_start(start)
        , d_end(end)
        , d_index(index) {}
    
    size_t start() const { 
        return d_start; 
    }
    
    size_t end() const { 
        return d_end; 
    }

    unsigned int index() const { 
        return d_index; 
    }
    
    size_t size() const { 
        return d_end - d_start + 1; 
    }

    bool overlaps(const piece& other) const {
        return d_start <= other.d_end && d_end >= other.d_start;
    }

    bool overlaps(size_t point) const {
        return d_start <= point && point <= d_end;
    }

    bool operator <(const piece& other) const {
        return d_start < other.d_start;
    }

    bool operator !=(const piece& other) const {
        return d_start != other.d_start || d_end != other.d_end;
    }

    bool operator ==(const piece& other) const {
        return d_start == other.d_start && d_end == other.d_end;
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_start;
        ar & d_end;
        ar & d_index; 
    }
};


#endif
