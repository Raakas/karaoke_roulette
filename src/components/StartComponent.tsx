import { useState } from 'react'
import VideoPlayerComponent from './VideoPlayerComponent'
import SongSearchComponent from './SongSearchComponent'

import { useDispatch, useSelector } from "react-redux"
import { ApiFetchService } from "../services/fetchService"
import {
    Song,
    updateYoutubeVideoCounter,
    setYoutubeUlrs,
    updateSetMessage,
    updateSource,
    updateTitle,
    updateTrackList,
    resetSongAndTracklist,
    FirestoreError,
    setYoutubeApiError,
    updateSearchParam,
    increaseErrorCount,
    resetErrorCounter,
    getNewSinger
} from "../store/App.slice"

import { RootState } from "../store/store"

const apiFetchService = new ApiFetchService()

const StartComponent = () => {

    const state = useSelector((state: RootState) => state.data)
    const { searchParam, youtubeApiError, trackList, source, searchType, title, errorCounter, errorLimit, youtubeSourceUrls } = { ...state, ...state.message }
    const dispatch = useDispatch()

    const GetSong = async (get_new_singer=true) => {

        const setMessageModal = (title?: string, error?: any) => {

            dispatch(updateSetMessage(
                {
                    title: title || '',
                    message: '',
                    isErrorMessage: error,
                    timer: 0,
                })
            )
        }

        let sourceUrl: string = ''
        let songTitle: string = ''
        let index: number = 0

        if (youtubeApiError === false) {
            if (!searchParam.length || searchParam === null || searchParam === undefined) {
                setMessageModal('Empty input, try again', true)
            }
        }

        if (trackList.length <= 1) {
            await apiFetchService.fetchTracklist(searchParam, youtubeApiError, title,
                source, searchType).then((songs: Array<Song>) => {
                    dispatch(updateTrackList(songs))

                    index = Math.floor(Math.random() * songs.length)
                    songTitle = songs[index].name
                })
                .catch((error: Error) => console.log('error:', error))
        }
        else {
            index = Math.floor(Math.random() * trackList.length)
            songTitle = trackList[index].name
        }

        setMessageModal('', false)

        if (youtubeApiError && trackList.length > 0) {
            const track = getSongFromTracklist()
            songTitle = track.name
            sourceUrl = track.source
        }
        else {
            dispatch(updateYoutubeVideoCounter(0))
            sourceUrl = await apiFetchService.getSongFromOldDatabase(songTitle, searchParam)
        }

        if (!!sourceUrl === false && youtubeApiError === false) {

            if (errorCounter >= errorLimit) {
                return setMessageModal(songTitle + ' not found, try something else')
            }

            let YoutubeResponse = await apiFetchService.getSongFromYoutube(songTitle)

            if (YoutubeResponse.error) {
                setMessageModal(YoutubeResponse.message, true)
                dispatch(setYoutubeApiError(true))
                dispatch(updateTrackList([]))
                dispatch(updateSearchParam(''))
                return
            }

            sourceUrl = YoutubeResponse.source

            dispatch(updateYoutubeVideoCounter(YoutubeResponse.counter))
            dispatch(setYoutubeUlrs(YoutubeResponse.urls))
        }

        if (sourceUrl === '') {
            let tracks = trackList
            tracks = tracks.filter(x => x.name !== songTitle)
            dispatch(updateTrackList(tracks))
            setMessageModal(songTitle + ' not found', true)
            return
        }

        if(get_new_singer){
            dispatch(getNewSinger())
        }
        dispatch(updateTitle(songTitle))
        dispatch(updateSource(sourceUrl.split('?')[0]))

        //saveSongToDatabase(songTitle, sourceUrl)

        dispatch(resetErrorCounter())
        setView('video')
    }

    const saveSongToDatabase = async (songTitle: string, sourceUrl: string ) => {
        let response: FirestoreError = await apiFetchService.saveToDatabase(songTitle, sourceUrl, searchType, searchParam)

        if (response.error) {
            console.log(response.error)
            dispatch(increaseErrorCount())
        }
    }

    const updateYoutubeSource = () => {
        let sources = [...youtubeSourceUrls]

        const source = sources.shift()
        const updateCounter = youtubeSourceUrls.length

        if (!!source){
            dispatch(updateSource(source))
            dispatch(updateYoutubeVideoCounter(updateCounter))
            dispatch(setYoutubeUlrs(sources))

            saveSongToDatabase(title, source)
        }
    }

    const getSongFromTracklist = () => {
        let track = trackList[Math.floor(Math.random() * trackList.length)]

        dispatch(updateTitle(track.name))
        dispatch(updateSource(track.source))
        setView('video')
        return track
    }

    const resetSongAndTracklistAndReturn = async () => {
        dispatch(resetSongAndTracklist(true))
        setView('search')
    }

    const [view, setView] = useState('search')

    return (
        <>
            {view === 'search'
                ? <SongSearchComponent getSong={GetSong} />
                : <VideoPlayerComponent 
                    getSong={GetSong} 
                    resetAndReturnViewToSearch={resetSongAndTracklistAndReturn}
                    updateYoutubeSource={updateYoutubeSource} 
                    saveSongToDatabase={saveSongToDatabase}
                />
            }
        </>
    )
}

export default StartComponent