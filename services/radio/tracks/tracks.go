package tracks

import (
	"io/ioutil"
	"math/rand"
	"os"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
)

type TrackFile struct {
	Filename string `json:'filename'`
}

var TrackFiles []TrackFile

func InitTracks() (err error) {
	conf := config.GetConfig()
	var files []os.FileInfo
	if files, err = ioutil.ReadDir(conf.Paths.MusicPath); err != nil {
		return err
	}
	trackFiles := make([]TrackFile, 0)
	for _, file := range files {
		trackFile := TrackFile{
			Filename: file.Name(),
		}
		trackFiles = append(trackFiles, trackFile)
	}
	TrackFiles = trackFiles
	return nil
}

func GetRandomTrack() TrackFile {
	return TrackFiles[rand.Intn(len(TrackFiles))]
}
