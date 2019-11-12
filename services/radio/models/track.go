package models

import (
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/jinzhu/gorm"
)

type Track struct {
	gorm.Model
	Name       string `json:"name" gorm:"unique_index;size:256"`
	PlaylistID uint
}

func CreateTrack(playlist Playlist, trackForm *forms.TrackForm) (track *Track, err error) {
	track = &Track{
		Name: trackForm.Name,
	}
	err = forms.ErrorArray2Error(db.Create(track).GetErrors())
	return
}

func ListTracks(playlistID uint) (tracks []Track, err error) {
	err = forms.ErrorArray2Error(db.Where("playlist_id = ?", playlistID).Find(&tracks).GetErrors())
	return
}

func DeleteTrack(trackID uint) (err error) {
	err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", trackID).GetErrors())
	return
}
