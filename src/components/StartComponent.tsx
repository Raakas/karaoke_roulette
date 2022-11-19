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

            dispatch({
                type: updateSetMessage,
                payload: {
                    title: title,
                    message: '',
                    isErrorMessage: error,
                    timer: 0,
                }
            })
        }

        let sourceUrl: string = ''
        let songTitle: string = ''
        let index: number = 0
        let foundSongFromDatabase = false

        if (youtubeApiError === false) {
            if (!searchParam.length || searchParam === null || searchParam === undefined) {
                setMessageModal('Empty input, try again', true)
            }
        }

        if (trackList.length <= 1) {
            await apiFetchService.fetchTracklist(searchParam, youtubeApiError, title,
                source, searchType).then((songs: Array<Song>) => {
                    dispatch({
                        type: updateTrackList, payload: songs
                    })

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
            dispatch({ type: updateYoutubeVideoCounter, payload: 0 })
            sourceUrl = await apiFetchService.getSongFromDatabase(songTitle, searchParam)
            foundSongFromDatabase = true
        }

        if (!!sourceUrl === false && youtubeApiError === false) {

            if (errorCounter >= errorLimit) {
                return setMessageModal(songTitle + ' not found, try something else')
            }

            let YoutubeResponse = await apiFetchService.getSongFromYoutube(songTitle)

            if (YoutubeResponse.error) {
                setMessageModal(YoutubeResponse.message, true)
                dispatch({ type: setYoutubeApiError, payload: true })
                dispatch({ type: updateTrackList, payload: [] })
                dispatch({ type: updateSearchParam, payload: '' })
                return
            }

            sourceUrl = YoutubeResponse.source

            dispatch({ type: updateYoutubeVideoCounter, payload: YoutubeResponse.counter })
            dispatch({type: setYoutubeUlrs, payload: YoutubeResponse.urls})
        }

        if (sourceUrl === '') {
            let tracks = trackList
            tracks = tracks.filter(x => x.name !== songTitle)
            dispatch({ type: updateTrackList, payload: tracks })
            setMessageModal(songTitle + ' not found', true)
            return
        }

        if(get_new_singer){
            dispatch({ type: getNewSinger })
        }
        dispatch({ type: updateTitle, payload: songTitle })
        dispatch({ type: updateSource, payload: sourceUrl.split('?')[0] })

        if(foundSongFromDatabase = false){
            saveSongToDatabase(songTitle, sourceUrl)
        }

        else {
            dispatch({ type: resetErrorCounter })
            setView('video')
        }
    }

    const saveSongToDatabase = async (songTitle: string, sourceUrl: string ) => {
        let response: FirestoreError = await apiFetchService.saveToDatabase(songTitle, sourceUrl, searchType, searchParam)

        if (response.error) {
            dispatch({ type: increaseErrorCount })
            //setMessageModal(response.message, true)
        }
    }

    const updateYoutubeSource = () => {
        let sources = [...youtubeSourceUrls]

        const source = sources.shift()
        const updateCounter = youtubeSourceUrls.length

        if (!!source){
            dispatch({ type: updateSource, payload: source })
            dispatch({ type: updateYoutubeVideoCounter, payload: updateCounter })
            dispatch({ type: setYoutubeUlrs, payload: sources })

            saveSongToDatabase(title, source)
        }
    }

    const getSongFromTracklist = () => {
        let track = trackList[Math.floor(Math.random() * trackList.length)]

        dispatch({ type: updateTitle, payload: track.name })
        dispatch({ type: updateSource, payload: track.source })
        setView('video')
        return track
    }

    const resetSongAndTracklistAndReturn = async () => {
        dispatch({ type: resetSongAndTracklist, payload: true })
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
                />
            }
        </>
    )
}

export default StartComponent