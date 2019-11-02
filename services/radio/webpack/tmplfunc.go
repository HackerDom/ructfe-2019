package webpack

import (
	"log"
)

func WebpackAssetPathFunc(assetName string) string {
	manifest, err := GetManifest()
	if err != nil {
		log.Fatalln(err)
		return ""
	}
	if asset, ok := manifest[assetName]; ok {
		return GetAssetPath(asset)
	}
	return ""
}

func WebpackAssetFunc(assetName string) string {
	manifest, err := GetManifest()
	if err != nil {
		log.Fatalln(err)
		return ""
	}
	if asset, ok := manifest[assetName]; ok {
		return GetJsAssetString(asset)
	}
	return ""
}
