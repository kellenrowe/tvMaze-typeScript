import axios from "axios"
import * as $ from 'jquery';

const BASE_URL: string = "http://api.tvmaze.com/"
const DEFAULT_IMG: string =
  "https://www.southwestjournal.com/wp-content/uploads/2018/11/shutterstock_1075355216.jpg"

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

type Show = {
  id: number,
  name: string,
  summary: string,
  image: { medium?: string, original?: string }
}

type Episode = {
  id: number,
  name: string,
  season: string,
  number: string
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term: string): Promise<Show[]> {

  let response = await axios.get(`${BASE_URL}search/shows?q=${term}`);

  let shows: Show[] = response.data.map((s: {show: Show}) => ({
    id: s.show.id,
    name: s.show.name,
    summary: s.show.summary,
    image: s.show.image?.medium || s.show.image?.original || DEFAULT_IMG
  }));
  
  return shows;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows : Show[]) : void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name} Image"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = String($("#searchForm-term").val());
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number) : Promise<Episode[]> {
  let response = await axios.get(`${BASE_URL}shows/${id}/episodes`);

  let episodes: Episode[] = response.data.map((e: Episode) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number
  }));
  
  return episodes;
}


/** Provided with an array of episodes info, 
 *  populates it into the #episodesList part of the DOM. */
function populateEpisodes(episodes: Episode[]) : void {
  $episodesArea.empty();

  for(let episode of episodes) {
    let $episode = $(`
      <li>
        ${episode.name} (season ${episode.season}, number ${episode.number})
      </li>`
    );
    $episodesArea.append($episode);
  }
  $episodesArea.show();
}


/** Provided with evt from the $showsList event listener 
 *  identifies id of show and calls to:
 *      getEpisodesOfShow &
 *      populateEpisodes
*/
async function searchForEpisodesAndDisplay(evt: JQuery.ClickEvent) {
  let $targetBtn = $(evt.target);
  let id: number = +$targetBtn.closest('.Show').data("show-id");
  let episodes: Episode[] = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);