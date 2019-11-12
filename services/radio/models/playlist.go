package models

import (
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/jinzhu/gorm"
)

type Playlist struct {
	gorm.Model
	Name        string  `json:"name" gorm:"unique_index;not null;size:256"`
	Description string  `json:"description"`
	Tracks      []Track `json:"-"`
	UserID      uint    `json:"-"`
}

func CreatePlaylist(user *User, playlistForm *forms.PlaylistForm) (playlist *Playlist, err error) {
	playlist = &Playlist{
		Name:        playlistForm.Name,
		Description: playlistForm.Description,
		UserID:      user.ID,
	}
	err = forms.ErrorArray2Error(db.Create(playlist).GetErrors())
	return
}

func ListPlaylist(user *User) (playlists []Playlist, err error) {
	err = forms.ErrorArray2Error(db.Where("user_id = ?", user.ID).Find(&playlists).GetErrors())
	return
}

func DeletePlaylist(playlistID uint, user *User) (err error) {
	err = forms.ErrorArray2Error(db.Where("id = ? AND user_id = ?", playlistID, user.ID).GetErrors())
	return
}
