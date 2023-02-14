/**
 * 
 * User: Luke Wilson
 * Date: 9th Feb 2023
 * Time: 14:37
 * 
 * 13th Feb 2023
 * Version 1.1 - Added automatic table creation and field/columns creation
 * 
 * TO DO:
 *  - Enable variable for number of results needed
 *  - Prefill "Format Type" and "Themes" with required tags
 */

//  __     __      _______    _             _____                                  __  __ 
//  \ \   / /     |__   __|  | |           / ____|                                /_ |/_ |
//   \ \_/ /__  _   _| |_   _| |__   ___  | (___   ___ _ __ __ _ _ __   ___ _ __   | | | |
//    \   / _ \| | | | | | | | '_ \ / _ \  \___ \ / __| '__/ _` | '_ \ / _ \ '__|  | | | |
//     | | (_) | |_| | | |_| | |_) |  __/  ____) | (__| | | (_| | |_) |  __/ |     | |_| |
//     |_|\___/ \__,_|_|\__,_|_.__/ \___| |_____/ \___|_|  \__,_| .__/ \___|_|     |_(_)_|
//                                                              | |                       
//                                                              |_|                       

//////////////////////////////////////
///////////// FUNCTIONS /////////////
/////////////////////////////////////

function getFieldTypeOptions(fieldType) {
  switch (fieldType) {
    case 'singleLineText':
    case 'multilineText':
    case 'email':
    case 'url':
    case 'singleCollaborator':
    case 'multipleCollaborators':
    case 'multilineText':
    case 'phoneNumber':
    case 'richText':
    case 'barcode':
    case 'multipleAttachments':
    case 'multipleRecordLinks':
      return null
    case 'duration':
      return { durationFormat: 'h:mm:ss' }
    case 'number':
      return { precision: 0 }
    case 'percent':
      return { precision: 5 }
    case 'currency':
      return { precision: 2, symbol: "$" }
    case 'singleSelect':
    case 'multipleSelects':
      return { name: " ", color: "#00b7f1" }
    case 'date':
      return { dateFormat: { name: 'friendly', format: 'LL' } }
    case 'dateTime':
      return { dateFormat: { name: 'friendly', format: 'LL' }, timeFormat: { name: '24hour', format: 'HH:mm' }, timeZone: 'utc' }
    case 'checkbox':
      return { icon: 'check', color: 'greenBright' }
    case 'rating':
      return { icon: 'star', max: 5, color: 'yellowBright' }
    default:
      throw new Error(`Unexpected field type ${fieldType}`)
  }
}

async function createMissingFields(table) {
  // Retrieve the existing fields in the table
  const existingFields = await table.fields;

  // Map the existing fields to an object for easier comparison
  const existingFieldMap = {};
  for (const field of existingFields) {
    existingFieldMap[field.name] = field;
  }

  // Loop through the field definitions and create any missing fields
  for (const fieldDefinition of fieldDefinitions) {
    const { name, type } = fieldDefinition;

    // Check if the field already exists in the table
    if (!existingFieldMap[name]) {
      // If not, create the field
      await table.createFieldAsync(name, type, getFieldTypeOptions(type));
    }
  }
}

/*
* If parts.length is equal to 2, then only the "mm:ss" format is used, and hours is set to 0. 
* If parts.length is equal to 3, then the "hh:mm:ss" format is used, and hours is set to parts[0].
*/
function timeToSeconds(time) {
  let parts = time.split(':').map(Number);
  let hours = parts.length === 2 ? 0 : parts[0];
  let minutes = parts[parts.length - 2];
  let seconds = parts[parts.length - 1];
  return hours * 3600 + minutes * 60 + seconds;
}

/*
* Converts a video time marker such as "PT3M53S" into "03:53"
*/
function parseDuration(PT) {
  var output = [];
  var durationInSec = 0;
  if (typeof PT === 'undefined' || PT === null) {
    PT = "PT0M00S";
  }
  var matches = PT.match(/P(?:(\d+\.*\d*)Y)?(?:(\d+\.*\d*)M)?(?:(\d+\.*\d*)W)?(?:(\d+\.*\d*)D)?T(?:(\d+\.*\d*)H)?(?:(\d+\.*\d*)M)?(?:(\d+\.*\d*)S)?/i);
  var parts = [
    { // years
      pos: 1,
      multiplier: 86400 * 365
    },
    { // months
      pos: 2,
      multiplier: 86400 * 30
    },
    { // weeks
      pos: 3,
      multiplier: 604800
    },
    { // days
      pos: 4,
      multiplier: 86400
    },
    { // hours
      pos: 5,
      multiplier: 3600
    },
    { // minutes
      pos: 6,
      multiplier: 60
    },
    { // seconds
      pos: 7,
      multiplier: 1
    }
  ];

  for (var i = 0; i < parts.length; i++) {
    if (typeof matches[parts[i].pos] != 'undefined') {
      durationInSec += parseInt(matches[parts[i].pos]) * parts[i].multiplier;
    }
  }

  // Hours extraction
  if (durationInSec > 3599) {
    output.push(parseInt(durationInSec / 3600));
    durationInSec %= 3600;
  }
  // Minutes extraction with leading zero
  output.push(('0' + parseInt(durationInSec / 60)).slice(-2));
  // Seconds extraction with leading zero
  output.push(('0' + durationInSec % 60).slice(-2));

  return output.join(':');
};

////////////////////////////////////////
///////////// TABLE SETUP /////////////
///////////////////////////////////////

//Required table setup
const fieldDefinitions = [
  { name: 'Title', type: 'singleLineText' },
  { name: 'Video ID', type: 'singleLineText' },
  { name: 'Video URL', type: 'url' },
  { name: 'View Count', type: 'number' },
  { name: 'Like Count', type: 'number' },
  { name: 'Comment Count', type: 'number' },
  { name: 'Duration', type: 'duration' },
  { name: 'Description', type: 'multilineText' },
  { name: 'Region Code', type: 'singleLineText' },
  { name: 'Upload Date', type: 'date' },
  { name: 'Video Tags', type: 'singleLineText' },
  { name: 'Video Definition', type: 'singleLineText' },
  { name: 'Video Thumbnail', type: 'multipleAttachments' },
  { name: 'Channel Name', type: 'singleLineText' },
  { name: 'Channel Subscribers', type: 'number' },
  { name: 'Channel View Count', type: 'number' },
  { name: 'Channel Total Videos', type: 'number' },
  { name: 'Channel URL', type: 'url' },
  { name: 'Format Type', type: 'singleLineText' },
  { name: 'Themes', type: 'singleLineText' },
  { name: 'Not Relevant?', type: 'checkbox' },
  { name: 'Data Checked?', type: 'checkbox' },
  { name: 'Platform', type: 'singleLineText' },
];

////////////////////////////////////////
////////////// INPUT FORM /////////////
///////////////////////////////////////

output.markdown("# YouTube Data Scraper v1.1");


const addTableOrField = await input.buttonsAsync('Do you want to create a new table or add data to an existing table?', [
  { label: 'Create new table', value: 'table', variant: 'primary' },
  { label: 'Add fields to existing table', value: 'fields', variant: 'primary' },
]);

if (addTableOrField === 'table') {
  const tableName = await input.textAsync('Name of table to create');
  //Create Primary Field
  let tableId = await base.createTableAsync(tableName, [
    { name: "Title", type: "singleLineText", options: getFieldTypeOptions("singleLineText") }
  ])
  output.markdown(`**Created table "${tableName}"**`);
  output.markdown(`Creating table fields...`);

  var table = base.getTable(tableName);
  await createMissingFields(table)
    .then(() => {
      output.markdown('Fields created successfully!');
    })
    .catch((error) => {
      console.error('Error creating missing fields:', error);
    });
} else {
  var table = await input.tableAsync('Which table do you want to add fields to?');
  let tableName = base.getTable(table.id);
  await createMissingFields(tableName)
    .then(() => {
      output.markdown('Fields created successfully!');
    })
    .catch((error) => {
      console.error('Error creating missing fields:', error);
    });
}

output.markdown(`**How do you want to scrape the YouTube data?**`);

let usePresets = await input.buttonsAsync(
  'Select an option below:',
  [
    { label: 'Use Search Presets', value: 'preset_search', variant: 'primary' },
    { label: 'Use Single Video Preset', value: 'preset_video', variant: 'primary' },
    { label: 'Use Custom Parameters', value: 'preset_no', variant: 'default' },
  ],
);

//Predefine the variables etc
var API_KEY = "[YOUR API KEY HERE]";

if (usePresets === 'preset_search' || usePresets === 'preset_video') {
  //Use current table
  // var tableId = cursor.activeTableId;
  // var table = base.getTable(tableId);
  //var table = base.getTable(baseTableName.trim());
  //Set generic vars
  var baseTableName = table.name;
  var channelType = "any";
  var order = "viewCount";
  var regionCode = "US";
}
//Set Search specific vars
if (usePresets === 'preset_search') {
  output.markdown(`**This will scrape the first 150 search results based on the US Region and View Count into table: "${table.name}"**`);

  var API_URL_TYPE = "search";
  var part = "snippet";
  //Require search terms
  var searchQuery = await input.textAsync('Enter search query');
}
//Set Video specific vars
if (usePresets === 'preset_video') {
  output.markdown("**This will scrape data for an individual video**");

  var API_URL_TYPE = "videos";
  var searchQuery = await input.textAsync('Enter Video ID (eg: dQw4w9WgXcQ)');
  var part = "contentDetails,snippet,statistics,status,id,player";
}

//Allow custom inputs
if (usePresets === 'preset_no') {
  output.markdown('**If you are unsure of any parameters, just use the examples in the input labels.**');

  //const API_URL = await input.textAsync('Enter API URL');
  var API_URL_TYPE = await input.textAsync('Enter Results Type (eg: "search" for a list or "videos" for a select videos)');
  //var API_KEY = await input.textAsync('Enter API Key');
  //var baseTableName = await input.textAsync('Enter Table Name to populate (must be exact)');
  //Set the table to modify
  var baseTableName = table.name;
  //var table = base.getTable(baseTableName.trim()); //eg: The Bear FX

  if (API_URL_TYPE === "search") {
    var searchQuery = await input.textAsync('Enter search query');
    var channelType = await input.textAsync('Enter channel result type (eg: any or show)');
    var order = await input.textAsync('Enter result order type (eg: relevance, date, title, rating, viewCount)');
  } else {
    var searchQuery = await input.textAsync('Enter video ID (Comma separated for multiples eg: dQw4w9WgXcQ, UiIRlg4Xr5w)');
  }
  var part = await input.textAsync('Enter result type (Use "snippet" for search or "contentDetails,snippet,statistics,status,id,player" for single videos)');
  var regionCode = await input.textAsync('Enter region code (eg: US or GB)');
}

let shouldContinue = await input.buttonsAsync(
  'Start Scraping YouTube?',
  [
    { label: 'Go for it!', value: 'yes', variant: 'primary' },
  ],
);

//Start the scraping!
if (shouldContinue === 'yes') {

  var capitalizedString = API_URL_TYPE.charAt(0).toUpperCase() + API_URL_TYPE.slice(1);

  output.markdown(`## Starting YouTube ${capitalizedString} Scrape for "${searchQuery}"...`);


  ////////////////////////////////////////
  /////////// PROCESS THE DATA////////////
  ///////////////////////////////////////

  const API_URL_BASE = "https://youtube.googleapis.com/youtube/v3/";

  let searchQueryEncoded = encodeURIComponent(searchQuery).trim();

  if (API_URL_TYPE === "search") {
    var searchTypeParam = "q";
  }
  if (API_URL_TYPE === "videos") {
    var searchTypeParam = "id";
  }

  //Built API URL
  if (API_URL_TYPE === "search") {
    var API_URL_FULL = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&maxResults=50&order=${order.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&key=${API_KEY.trim()}`;
  } else {
    var API_URL_FULL = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&key=${API_KEY.trim()}`;
  }

  //console.info("API: " + API_URL_FULL);
  // Uncomment if `headers` are required
  // const headers = {
  //   Authorization:
  //     "Bearer " + API_KEY
  // };

  // Get API results page 1 (first 50 results) -- Google limits API response to max 50
  const apiResponse = await fetch(API_URL_FULL); //, { headers });
  const apiResult = await apiResponse.json();

  // Check results exit
  if (apiResult.items && apiResult.items.length) {
    //Select table
    const selectedTable = base.getTable(baseTableName.trim()); //The Bear FX  

    //Only do this for search result lists
    if (API_URL_TYPE === "search") {
      //Pagination key for next 50 results
      let nextPageToken = apiResult.nextPageToken;

      if (nextPageToken) {
        const API_URL_NEXTPAGE = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&maxResults=50&order=${order.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&pageToken=${nextPageToken}&key=${API_KEY.trim()}`;
        // Get API results page 2 (next 50 results)
        const apiResponseNext = await fetch(API_URL_NEXTPAGE);
        var apiResultNext = await apiResponseNext.json();

        //Pagination key for next 50 results (probably better to loop this in a future update to the code!)
        var nextNextPageToken = apiResultNext.nextPageToken;
      } else {
        var apiResultNext = { items: [] }
      }

      if (nextNextPageToken) {
        const API_URL_NEXT_NEXTPAGE = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&maxResults=50&order=${order.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&pageToken=${nextNextPageToken}&key=${API_KEY.trim()}`;
        // Get API results page 3 (next 50 results)
        const apiResponseNextNext = await fetch(API_URL_NEXT_NEXTPAGE);
        var apiResultNextNext = await apiResponseNextNext.json();
      } else {
        var apiResultNextNext = { items: [] }
      }

      //Merge both page results items to get first 150 results needed
      const apiResultItemsMerged = [...apiResult.items, ...apiResultNext.items, ...apiResultNextNext.items];
      //console.log(apiResultItemsMerged)

      //Join it all back together for iteration...
      apiResult['items'] = apiResultItemsMerged;
    }

    //Loop results to extract data and create table rows
    var imported = 0;
    var skipped = 0;
    var skippedVideo = 0;
    for (let apiResultItems of apiResult.items) {
      //console.log(apiResultItems)
      //Get statistics for each video with this API call:

      // Get video and channel statistics and merge to search results
      if (API_URL_TYPE === "search") {

        //Skip removed videos to avoid breaking the script 
        if (apiResultItems.id.videoId === "undefined" || apiResultItems.id.videoId === undefined || apiResultItems.id.videoId === "") {
          //console.log("Skipping Removed Video");
          skippedVideo++;
          continue;
        }

        //Skip playlists to avoid breaking the script (they don't all have the same details)
        if (apiResultItems.id.playlistId) {
          //console.log("Skipping playlist");
          skipped++;
          continue;
        }

        //Get current iteration video ID
        let videoId = apiResultItems.id.videoId;

        //Get video stats
        let statisticsAPI = `${API_URL_BASE.trim()}videos?part=contentDetails,snippet,statistics,status,id,player&id=${videoId}&regionCode=${regionCode.trim()}&key=${API_KEY.trim()}`;
        let apiStatisticsResponse = await fetch(statisticsAPI);
        let apiStatisticsResult = await apiStatisticsResponse.json();

        //console.info(statisticsAPI)
        //console.log(apiStatisticsResult);

        //Get the channel stats
        let channelAPI = `${API_URL_BASE.trim()}channels?part=statistics&id=${apiResultItems.snippet['channelId']}&key=${API_KEY.trim()}`;
        let apiChannelResponse = await fetch(channelAPI);
        let apiChannelResult = await apiChannelResponse.json();

        //console.log(apiChannelResult);

        //Merge the arrays
        //console.warn(apiStatisticsResult)
        if (apiChannelResult.items.length) {
          apiResultItems['channelStatistics'] = apiChannelResult.items[0].statistics;
        } else {
          apiResultItems['channelStatistics'] = [];
        }
        if (apiStatisticsResult.items.length) {
          apiResultItems['videoStatistics'] = apiStatisticsResult.items[0].statistics;
          apiResultItems['contentDetails'] = apiStatisticsResult.items[0].contentDetails;
          apiResultItems['videoTags'] = apiStatisticsResult.items[0].snippet.tags;
          apiResultItems['videoDescription'] = apiStatisticsResult.items[0].snippet.description;
          apiResultItems['videoStatus'] = apiStatisticsResult.items[0].status;
          //apiResultItems['embedVideo'] = apiStatisticsResult.items[0].player.embedHtml;
          apiResultItems['topicDetails'] = apiStatisticsResult.items[0].topicDetails;

        } else {
          apiResultItems['videoStatistics'] = [];
          apiResultItems['contentDetails'] = [];
          apiResultItems['videoTags'] = [];
          apiResultItems['videoDescription'] = [];
          apiResultItems['videoStatus'] = [];
          //apiResultItems['embedVideo'] = [];
          apiResultItems['topicDetails'] = [];
          apiResultItems['channelStatistics'] = [];
        }

        //Extract needed stats
        let title = apiResultItems.snippet['title'];
        let ytVideoId = videoId;
        let ytURL = `https://www.youtube.com/watch?v=${videoId}`;
        let viewCount = parseInt(apiResultItems.videoStatistics['viewCount']) ? parseInt(apiResultItems.videoStatistics['viewCount']) : 0;
        let likeCount = parseInt(apiResultItems.videoStatistics['likeCount']) ? parseInt(apiResultItems.videoStatistics['likeCount']) : 0;
        let commentCount = parseInt(apiResultItems.videoStatistics['commentCount']) ? parseInt(apiResultItems.videoStatistics['commentCount']) : 0;
        let videoDurationFormatted = parseDuration(apiResultItems.contentDetails['duration']) ? parseDuration(apiResultItems.contentDetails['duration']) : "00:00";
        let videoDuration = timeToSeconds(videoDurationFormatted);
        let description = apiResultItems.videoDescription ? apiResultItems.videoDescription : "";
        let publishedDate = apiResultItems.snippet['publishedAt'];
        let tags = apiResultItems.videoTags;
        //console.log(tags)
        if (tags !== undefined) {
          tags = tags.toString(); //flatten array
        }
        let definition = apiResultItems.contentDetails.definition;
        //let embedVideo = apiResultItems.embedVideo; //iframe code
        let thumbnailHighRes = [{ url: apiResultItems.snippet.thumbnails.high['url'] }];
        let channelTitle = apiResultItems.snippet.channelTitle;
        let subscriberCount = parseInt(apiResultItems.channelStatistics.subscriberCount);
        let channelViewCount = parseInt(apiResultItems.channelStatistics.viewCount);
        let videoCount = parseInt(apiResultItems.channelStatistics.videoCount);
        let ytChannelURL = `https://www.youtube.com/channel/${apiResultItems.snippet['channelId']}`;
        let platform = "YouTube";

        //Finally, create all the records in the AirTable :)
        var recordIds = await selectedTable.createRecordsAsync([
          {
            fields:
            {
              'Title': title,
              'Video ID': ytVideoId,
              'Video URL': ytURL,
              'View Count': viewCount,
              'Like Count': likeCount,
              'Comment Count': commentCount,
              'Duration': videoDuration,
              'Description': description.toString(),
              'Region Code': regionCode.trim(),
              'Upload Date': publishedDate,
              'Video Tags': tags,
              'Video Definition': definition,
              //'Video Embed Code': embedVideo,
              'Video Thumbnail': thumbnailHighRes,
              'Channel Name': channelTitle,
              'Channel Subscribers': subscriberCount,
              'Channel View Count': channelViewCount,
              'Channel Total Videos': videoCount,
              'Channel URL': ytChannelURL,
              'Platform': platform,
            },
          }
          ,]);
      } //end search logic

      //Single video -- some of the returned arrays differ slightly from the main search list
      if (API_URL_TYPE === "videos") {
        //For search result statistics    
        //console.log("Amending search items array!");

        let videoId = apiResultItems.id;

        //Get video stats
        let statisticsAPI = `${API_URL_BASE.trim()}videos?part=contentDetails,snippet,statistics,status,id,player&id=${videoId}&regionCode=${regionCode.trim()}&key=${API_KEY.trim()}`;
        let apiStatisticsResponse = await fetch(statisticsAPI);
        let apiStatisticsResult = await apiStatisticsResponse.json();

        //Get the channel stats
        let channelAPI = `${API_URL_BASE.trim()}channels?part=statistics&id=${apiResultItems.snippet['channelId']}&key=${API_KEY.trim()}`;
        let apiChannelResponse = await fetch(channelAPI);
        let apiChannelResult = await apiChannelResponse.json();

        //Merge the arrays
        apiResultItems['videoStatistics'] = apiStatisticsResult.items[0].statistics;
        //apiResultItems['contentDetails'] = apiStatisticsResult.items[0].contentDetails;
        //apiResultItems['videoTags'] = apiStatisticsResult.items[0].snippet.tags;
        //apiResultItems['videoDescription'] = apiStatisticsResult.items[0].snippet.description;
        apiResultItems['videoStatus'] = apiStatisticsResult.items[0].status;
        //apiResultItems['embedVideo'] = apiStatisticsResult.items[0].player.embedHtml;
        apiResultItems['topicDetails'] = apiStatisticsResult.items[0].topicDetails;
        apiResultItems['channelStatistics'] = apiChannelResult.items[0].statistics;

        //Convert tags array to multiselect (only works if tags exist in table already)
        // let tags = new Array;
        // for(let tagsName of apiResultItems.snippet.tags){
        //     tags.push({name: tagsName})
        // }

        // let channelTitle = new Array;
        // channelTitle.push({name: apiResultItems.snippet.channelTitle});
        // console.info(channelTitle)

        //Extract needed stats
        let title = apiResultItems.snippet['title'];
        let ytVideoId = apiResultItems.id;
        let ytURL = `https://www.youtube.com/watch?v=${apiResultItems.id}`;
        let viewCount = parseInt(apiResultItems.statistics['viewCount']) ? parseInt(apiResultItems.statistics['viewCount']) : 0;
        let likeCount = parseInt(apiResultItems.statistics['likeCount']) ? parseInt(apiResultItems.statistics['likeCount']) : 0;
        let commentCount = parseInt(apiResultItems.statistics['commentCount']) ? parseInt(apiResultItems.statistics['commentCount']) : 0;
        let videoDurationFormatted = parseDuration(apiResultItems.contentDetails['duration']) ? parseDuration(apiResultItems.contentDetails['duration']) : "00:00";
        let videoDuration = timeToSeconds(videoDurationFormatted);
        let description = apiResultItems.snippet.description;
        let publishedDate = apiResultItems.snippet['publishedAt'];
        let tags = apiResultItems.snippet.tags;
        if (tags.length) {
          tags = tags.toString(); //flatten array
        }
        let definition = apiResultItems.contentDetails.definition;
        let embedVideo = apiResultItems.player.embedHtml; //iframe code
        let thumbnailHighRes = [{ url: apiResultItems.snippet.thumbnails.maxres['url'] }];
        let channelTitle = apiResultItems.snippet['channelTitle'];
        let subscriberCount = parseInt(apiResultItems.channelStatistics.subscriberCount);
        let channelViewCount = parseInt(apiResultItems.channelStatistics.viewCount);
        let videoCount = parseInt(apiResultItems.channelStatistics.videoCount);
        let ytChannelURL = `https://www.youtube.com/channel/${apiResultItems.snippet['channelId']}`;
        let platform = "YouTube";

        //Finally, create all the records in the AirTable :)
        var recordIds = await selectedTable.createRecordsAsync([
          {
            fields:
            {
              'Title': title,
              'Video ID': ytVideoId,
              'Video URL': ytURL,
              'View Count': viewCount,
              'Like Count': likeCount,
              'Comment Count': commentCount,
              'Duration': videoDuration,
              'Description': description.toString(),
              'Region Code': regionCode.trim(),
              'Upload Date': publishedDate,
              'Video Tags': tags,
              'Video Definition': definition,
              //'Video Embed Code': embedVideo,
              'Video Thumbnail': thumbnailHighRes,
              'Channel Name': channelTitle,
              'Channel Subscribers': subscriberCount,
              'Channel View Count': channelViewCount,
              'Channel Total Videos': videoCount,
              'Channel URL': ytChannelURL,
              'Platform': platform,
            },
          }
          ,]);
        //console.log(recordIds)
      } //end video logic

      //console.debug(apiResultItems);
      imported++;
    } //end loop

    //console.log("Success!");
    output.markdown(`## Success!`);
    output.markdown(`## Results:`);
    output.markdown(`* ${imported} imported video data`);
    output.markdown(`* ${skipped} skipped playlists`);
    output.markdown(`* Skipped ${skippedVideo} removed/unavailable videos`);

  } else { //end array check
    if (apiResult.error) {
      output.markdown(`## Error ${apiResult.error.code} ${apiResult.error.errors[0].reason}! ${apiResult.error.message}`);
    }
  }

} //end button logic
