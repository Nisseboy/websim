const Genius = require("genius-lyrics") // import the library
const Client = new Genius.Client() // setup the Genius Lyrics API

async function retrieveLyrics() {
  const songs = await Client.songs.search("Pop Smoke") // Get songs from Pop Smoke

  const indexSongs = Math.floor(Math.random() * Math.floor(songs.length))
  const lyrics = await songs[indexSongs].lyrics() // Get random song

  const arrLyrics = lyrics.split("\n").filter(l => l.length && l[0] !== '[')
  const indexLyrics = Math.floor(Math.random() * Math.floor(arrLyrics.length))
  return arrLyrics[indexLyrics] // Return random lyrics
}

module.exports = async (req, res) => { // this function will be launched when the API is called.
  try {
    res.send(await retrieveLyrics()) // send the lyrics
  } catch (err) {
    res.send(err) // send the thrown error
  }
}
