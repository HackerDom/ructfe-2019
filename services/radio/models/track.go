package models

import (
	"fmt"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/tracks"
	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/jinzhu/gorm"
)

type Track struct {
	gorm.Model
	Name       string `json:"name" gorm:"size:256"`
	TrackPath  string `json:"track_path"`
	PlaylistID uint
}

func CreateTrack(playlist *Playlist) (track *Track, err error) {
	track = &Track{
		Name:       utils.GetRandomName(10),
		TrackPath:  tracks.GetRandomTrack().Filename,
		PlaylistID: playlist.ID,
	}
	if err = forms.ErrorArray2Error(db.Create(track).GetErrors()); err != nil {
		return nil, fmt.Errorf("Can't create track")
	}
	return
}

func DeleteTrack(trackID uint, user *User) (err error) {
	track := &Track{}
	if err = forms.ErrorArray2Error(db.Find(&track, trackID).GetErrors()); err != nil {
		return fmt.Errorf("Can't delete track")
	}
	playlist := &Playlist{}
	if err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", track.PlaylistID, user.ID).First(&playlist).GetErrors()); err != nil {
		return fmt.Errorf("Can't delete track")
	}
	if err = forms.ErrorArray2Error(db.Model(&track).Delete(&track).GetErrors()); err != nil {
		return fmt.Errorf("Can't delete track")
	}
	return
}
