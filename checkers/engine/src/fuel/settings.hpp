#ifndef HPP_SETTINGS
#define HPP_SETTINGS

#include <boost/serialization/access.hpp>


class settings {
    bool d_without_overlaps;
    bool d_match_entire;
    bool d_ignore_case;

public:
    settings()
        : d_without_overlaps(false)
        , d_match_entire(false)
        , d_ignore_case(false) {}

    bool is_without_overlaps() const { 
        return d_without_overlaps; 
    }
    
    void set_without_overlaps(bool val) { 
        d_without_overlaps = val; 
    }

    bool is_match_entire() const { 
        return d_match_entire; 
    }
    
    void set_match_entire(bool val) { 
        d_match_entire = val; 
    }

    bool is_ignore_case() const { 
        return d_ignore_case; 
    }
    
    void set_ignore_case(bool val) { 
        d_ignore_case = val; 
    }

private:
    friend class boost::serialization::access;

    template <typename Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & d_without_overlaps;
        ar & d_match_entire;
        ar & d_ignore_case;
    }
};


#endif
