package webpack

import "fmt"

func GetAssetPath(name string) string {
	return fmt.Sprintf("/static/build/%v", name)
}

func GetJsAssetString(name string) string {
	return fmt.Sprintf("<script src=\"%v\"></script>", GetAssetPath(name))
}
