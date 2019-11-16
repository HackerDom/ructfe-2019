package models

import (
	"fmt"
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/jinzhu/gorm"
)

type Track struct {
	gorm.Model
	Name       string `json:"name" gorm:"size:256"`
	PlaylistID uint
}

func CreateTrack(playlist Playlist, trackForm *forms.TrackForm) (track *Track, err error) {
	track = &Track{
		Name: utils.GetRandomName(10),
	}
	err = forms.ErrorArray2Error(db.Create(track).GetErrors())
	if err != nil {
		return nil, fmt.Errorf("Can't create track")
	}
	return
}

func DeleteTrack(trackID uint) (err error) {
	err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", trackID).GetErrors())
	return
}
