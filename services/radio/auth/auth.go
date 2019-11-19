package auth

import "plugin"

import "fmt"

const pluginName = "./radio-auth.so"

type EncodeFn = func(interface{}) string
type DecodeFn = func(string, interface{}) error
type InitAuthFn = func(string)

var Encode EncodeFn
var Decode DecodeFn

func InitAuth(init string) (err error) {
	var plug *plugin.Plugin
	if plug, err = plugin.Open(pluginName); err != nil {
		return
	}
	var encodeFnSym, decodeFnSym, initAuthSym plugin.Symbol
	if encodeFnSym, err = plug.Lookup("Encode"); err != nil {
		return
	}
	if decodeFnSym, err = plug.Lookup("Decode"); err != nil {
		return
	}
	var ok bool
	if Encode, ok = encodeFnSym.(EncodeFn); !ok {
		return fmt.Errorf("Can't read encode function from auth module")
	}
	if Decode, ok = decodeFnSym.(DecodeFn); !ok {
		return fmt.Errorf("Can't read encode function from auth module")
	}
	if initAuthSym, err = plug.Lookup("InitAuth"); err != nil {
		return
	}
	var initFn InitAuthFn
	if initFn, ok = initAuthSym.(InitAuthFn); !ok {
		return fmt.Errorf("Can't read InitAuth function from auth module")
	}
	initFn(init)
	return
}
