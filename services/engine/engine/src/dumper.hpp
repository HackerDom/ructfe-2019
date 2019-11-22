#ifndef HPP_DUMPER
#define HPP_DUMPER

#include <iostream>

#include <boost/optional.hpp>
#include <boost/archive/binary_oarchive.hpp>
#include <boost/archive/binary_iarchive.hpp>
#include <boost/iostreams/filter/zlib.hpp>
#include <boost/iostreams/filtering_stream.hpp>


template<class MyClass>
class dumper {
public:
	static bool save(MyClass const& obj, std::ostream& os) {
		boost::iostreams::filtering_ostream fos;

		fos.push(boost::iostreams::zlib_compressor());
		fos.push(os);

		boost::archive::binary_oarchive bo(fos);

		try {
			bo << obj;
		}
		catch (...) {
			return false;
		}

		return true;
	}

	static boost::optional<MyClass> load(std::istream& is) {
		MyClass obj;
		
		boost::iostreams::filtering_istream fis;

		fis.push(boost::iostreams::zlib_decompressor());
		fis.push(is);

		boost::archive::binary_iarchive bi(fis);

		try {
			bi >> obj;
		}
		catch (...) {
			return boost::optional<MyClass>();
		}

		return boost::optional<MyClass>(obj);
	}
};


#endif
