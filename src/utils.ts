export const filterYoutubeResponseTitle = (
  youtube_title: string,
  search_title: string,
) => {
  return (
    youtube_title.includes(search_title) &&
    youtube_title.includes('karaoke') &&
    !youtube_title.includes('cover')
  )
}
