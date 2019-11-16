package models

import (
	"fmt"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/jinzhu/gorm"
)

type Playlist struct {
	gorm.Model
	Name        string  `json:"name" gorm:"not null;size:256"`
	Description string  `json:"description"`
	Private     bool    `json:"private"`
	Tracks      []Track `json:"tracks"`
	UserID      uint    `json:"-"`
}

func PlaylistCreate(user *User, playlistForm forms.PlaylistForm) (playlist *Playlist, err error) {
	playlist = &Playlist{
		Name:        playlistForm.Name,
		Description: playlistForm.Description,
		Private:     playlistForm.Private,
		UserID:      user.ID,
	}
	err = forms.ErrorArray2Error(db.Create(playlist).GetErrors())
	return
}

func PlaylistList(user *User) (playlists []Playlist, err error) {
	err = forms.ErrorArray2Error(db.Where("user_id = ?", user.ID).Find(&playlists).GetErrors())
	return
}

func PlaylistGet(playlistID uint, user *User) (playlist *Playlist, err error) {
	playlist = &Playlist{}
	err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", playlistID, user.ID).First(&playlist).GetErrors())
	if err != nil {
		return nil, fmt.Errorf("Can't get playlist")
	}
	tracks := make([]Track, 0)
	db.Model(&playlist).Related(&tracks)
	playlist.Tracks = tracks
	return
}

func PlaylistDelete(playlistID uint, user *User) (err error) {
	err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", playlistID, user.ID).Delete(&Playlist{}).GetErrors())
	if err != nil {
		return fmt.Errorf("Can't delete DB")
	}
	return
}
