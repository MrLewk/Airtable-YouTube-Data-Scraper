//  __     __      _______    _             _____                                  ___    ___  
//  \ \   / /     |__   __|  | |           / ____|                                |__ \  / _ \ 
//   \ \_/ /__  _   _| |_   _| |__   ___  | (___   ___ _ __ __ _ _ __   ___ _ __     ) || | | |
//    \   / _ \| | | | | | | | '_ \ / _ \  \___ \ / __| '__/ _` | '_ \ / _ \ '__|   / / | | | |
//     | | (_) | |_| | | |_| | |_) |  __/  ____) | (__| | | (_| | |_) |  __/ |     / /_ | |_| |
//     |_|\___/ \__,_|_|\__,_|_.__/ \___| |_____/ \___|_|  \__,_| .__/ \___|_|    |____(_)___/ 
//                                                              | |                            
//                                                              |_|                            
/**
 * User: Luke Wilson - luke.wilson@stormideas.com
 * Date: 9th Feb 2023
 * Time: 14:37
 * 
 * 13th Feb 2023
 * Version 1.1 - Added automatic table creation and field/columns creation
 *
 * 14th Feb 2023
 * Version 1.2 - Added filter to remove any duplicate results before it populates the Airtable
 * 
 * 17th Feb 2023
 * Version 1.3 - Added default multi options in the "Format Type", "Themes", and "Platform" columns when creating the fields
 *             - Updated "Video Tags" to be MultiSelect and automatically populated the defaults
 * 
 * 23rd Feb 2023
 * Version 1.4 - Fixed bug when scraping a video with no tags
 *             - Fixed bug where multi options were duplicated when selecting existing table
 * 
 * 1st March 2023
 * Version 1.5 - Updated thumbnail code to grab all available thumbnail resolutions
 *             - Updated Single video selection to accomodate multiple video IDs
 * 
 * 28th April 2023
 * Version 1.6 - Fixed a bug with duplicate video tags breaking the script
 * 
 * 17th May 2023
 * Version 1.7 - Added Channel Description and Country Code, and updated channel URL to use the @ handle if it exist
 * 
 * 26th Jan 2024
 * Version 1.8 - Added new option to scrape video data from a specified channel
 *             - Added new options to customise the results better
 *             - Removed the Custom Parameters button option as it wasn't being maintained and probably more complex than needed for most people
 * 
 * 2nd Feb 2024
 * Version 2.0 - Restructured the Extension to be more generic and flexible for most use cases
 *             - Added new keyword search options to select from channel, video results
 *             - Added variable search result to specify a number of results up to 150
 *             - Added new cadence fields for more channel stats
 *             - Added new `debug` option
 *             - Added detection for a short or video
 *             - Added option to select which API to use if you need more quota allowance
 *                - Unofficial API docs: https://yt.lemnoslife.com/
 *             - Added table field lookup option to batch import existing channel/video IDs
 * 
 * TO DO:
 *  - Add playlist search option
 *  - Add option to just scrape thumbnails?
 */

var scriptVersion = "2.0";
var scriptLastUpdated = "19th March 2024";
var debug = false; //set to TRUE to see additional console logging

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
      return { choices: [{ name: " " }] }
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

async function createMissingFields(table, tableType) {
  // Retrieve the existing fields in the table
  const existingFields = await table.fields;

  // Map the existing fields to an object for easier comparison
  const existingFieldMap = {};
  for (const field of existingFields) {
    existingFieldMap[field.name] = field;
  }

  if (tableType == "scrapeVids") { var fieldDefinitions = fieldDefinitions_video; }
  if (tableType == "scrapeChannel") { var fieldDefinitions = fieldDefinitions_channel; }

  // Loop through the field definitions and create any missing fields
  for (const fieldDefinition of fieldDefinitions) {
    const { name, type, description } = fieldDefinition;

    // Check if the field already exists in the table
    if (!existingFieldMap[name]) {
      // If not, create the field
      if (type == "number" && (name == "Average Post likes" || name == "Average Post/Year" || name == "Average Post/Month")) {
        await table.createFieldAsync(name, type, { precision: 2 }, description);
      } else {
        await table.createFieldAsync(name, type, getFieldTypeOptions(type), description);
      }
    }
  }
}

async function createSelectOptions(table, tableType) {
  //Add Single and Multi Select default options to the table

  const formatField = table.getField("Format Type");
  //Only run this if the preset options don't exist
  if (formatField.options.choices.length < 15) {
    await formatField.updateOptionsAsync({
      choices: [
        ...formatField.options.choices,
        { name: "Meme", color: "blueLight2" },
        { name: "Countdown", color: "cyanLight2" },
        { name: "Supercut", color: "tealLight2" },
        { name: "Listicle", color: "greenLight2" },
        { name: "Theories", color: "yellowLight2" },
        { name: "Behind the Scenes", color: "orangeLight2" },
        { name: "Interview Cast/Crew", color: "redLight2" },
        { name: "Fan Content/Art", color: "pinkLight2" },
        { name: "Promos", color: "purpleLight2" },
        { name: "Straight Lift", color: "grayLight2" },
        { name: "Announcement", color: "blueLight2" },
        { name: "Actor Photos", color: "cyanLight2" },
        { name: "Review", color: "tealLight2" },
        { name: "Shorts", color: "greenLight2" },
      ],
    });
  }

  const themesField = table.getField("Themes");
  //Only run this if the preset options don't exist
  if (themesField.options.choices.length < 15) {
    await themesField.updateOptionsAsync({
      choices: [
        ...themesField.options.choices,
        { name: "Talent", color: "blueLight2" },
        { name: "Music", color: "cyanLight2" },
        { name: "Relationships", color: "tealLight2" },
        { name: "Food", color: "greenLight2" },
        { name: "Celebrity Feature", color: "yellowLight2" },
        { name: "Character", color: "orangeLight2" },
        { name: "Behind the Scenes", color: "redLight2" },
        { name: "Friendship", color: "pinkLight2" },
        { name: "Conflict", color: "purpleLight2" },
        { name: "Humor", color: "grayLight2" },
        { name: "Fan Appreciation", color: "blueLight2" },
        { name: "Emotional", color: "cyanLight2" },
        { name: "Review", color: "tealLight2" },
        { name: "Chaos", color: "greenLight2" },
      ],
    });
  }

  const platformField = table.getField("Platform");
  //Only run this if the preset options don't exist
  if (platformField.options.choices.length < 2) {
    await platformField.updateOptionsAsync({
      choices: [
        ...platformField.options.choices,
        { name: "YouTube", color: "blueLight2" }],
    });
  }

  if (tableType === "scrapeVids") {
    const contentTypeField = table.getField("Content Type");
    //Only run this if the preset options don't exist
    if (contentTypeField.options.choices.length < 2) {
      await contentTypeField.updateOptionsAsync({
        choices: [
          ...contentTypeField.options.choices,
          { name: "Video", color: selectRandomColour() },
          { name: "Short", color: selectRandomColour() }
        ],
      });
    }
  }

}

function selectRandomColour() {
  const options = ["blueLight2", "cyanLight2", "tealLight2", "greenLight2", "yellowLight2", "orangeLight2", "redLight2", "pinkLight2", "purpleLight2", "grayLight2"];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function convertTagsArray(tags) {

  //Filter out any duplicate tags so it doesn't break the Airtable row update
  const uniqueNewTagsSet = new Set(tags);
  const uniqueNewTagsArray = Array.from(uniqueNewTagsSet);

  //Remap tags to the select object format, with a randomly selected colour
  const newTagsArray = uniqueNewTagsArray.map((name) => {
    return { name: name };
  });

  return newTagsArray;
}

async function generateTagChoices(table, fieldName, tags) {

  //Filter out any duplicate tags so it doesn't break the Airtable row update
  const uniqueNewTagsSet = new Set(tags);
  const uniqueNewTagsArray = Array.from(uniqueNewTagsSet);

  //Remap tags to the select object format, with a randomly selected colour
  const newTagsArray = uniqueNewTagsArray.map((name) => {
    return { name: name, color: selectRandomColour() };
  });

  // Add Single and Multi Select default options to the table
  const tagsField = table.getField(fieldName);

  // Ensure `tagsField.options.choices` is initialized
  const existingChoices = tagsField.options.choices || [];

  // Calculate the remaining available slots for new tags
  const remainingSlots = Math.max(0, 10000 - existingChoices.length);

  // Take only the allowed number of new tags
  const newTagsWithoutDuplicates = newTagsArray.slice(0, remainingSlots);

  // Update options only if there are new tags to add
  if (newTagsWithoutDuplicates.length > 0) {
    //Add Single and Multi Select default options to the table
    const tagsField = table.getField(fieldName);
    await tagsField.updateOptionsAsync({
      choices: [
        ...tagsField.options.choices,
        ...newTagsArray
      ],
    });
  } else {
    if (debug) {
      console.warn("No new tags added. Field limit reached (10,000).");
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
  if (typeof PT === 'undefined' || PT === null || PT === "P0D") {
    PT = "PT0M00S";
    //P0D returns from scheduled videos
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
    if (matches[parts[i].pos] !== null && matches[parts[i].pos] !== undefined) {
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


// Posting Cadence
function calculatePostingCadence(isoTimestamps) {
  // Convert ISO timestamps to Date objects
  const postDates = isoTimestamps.map(timestamp => new Date(timestamp));

  // Sort the dates in ascending order
  postDates.sort((a, b) => a - b);

  // Calculate the time difference in milliseconds between each consecutive post
  const timeDifferences = [];
  for (let i = 1; i < postDates.length; i++) {
    const diff = postDates[i] - postDates[i - 1];
    timeDifferences.push(diff);
  }

  // Calculate the average time difference
  const averageTimeDifference = timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length;

  // Calculate posts per year and posts per month
  const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000; // accounting for leap years
  const millisecondsInMonth = 30.44 * 24 * 60 * 60 * 1000; // average days in a month

  const postsPerYear = 1 / (averageTimeDifference / millisecondsInYear);
  const postsPerMonth = 1 / (averageTimeDifference / millisecondsInMonth);

  return {
    postsPerYear: postsPerYear.toFixed(2),
    postsPerMonth: postsPerMonth.toFixed(2),
  };
}

function convertHtmlLinkToMarkdown(htmlText) {
  // Replace HTML anchor tags with Markdown link syntax
  const markdownText = htmlText.replace(/<a.*?href="'["'][^>]*>(.*?)<\/a>/igm, "$2");
  return markdownText;
}

const getVideoDetails = async (apiURL, video_ids) => {
  const videoDetails = [];

  for (let i = 0; i < video_ids.length; i += 50) {
    const chunk = video_ids.slice(i, i + 50);
    const videoIdsStr = chunk.join(',');

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIdsStr}&key=${api_key}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        videoDetails.push(...data.items);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  }

  return videoDetails;
};

////////////////////////////////////////
///////////// TABLE SETUP /////////////
///////////////////////////////////////

//Required table setup
const fieldDefinitions_video = [
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
  { name: 'Content Type', type: 'singleSelect' },
  { name: 'Video Tags', type: 'multipleSelects' },
  { name: 'Video Definition', type: 'singleLineText' },
  { name: 'Video Thumbnail', type: 'multipleAttachments' },
  { name: 'Channel ID', type: 'singleLineText' },
  { name: 'Channel Name', type: 'singleLineText' },
  { name: 'Channel Description', type: 'multilineText' },
  { name: 'Channel Subscribers', type: 'number' },
  { name: 'Channel View Count', type: 'number' },
  { name: 'Channel Total Videos', type: 'number' },
  { name: 'Channel URL', type: 'url' },
  { name: 'Channel Country', type: 'singleLineText' },
  { name: 'Format Type', type: 'multipleSelects' },
  { name: 'Themes', type: 'multipleSelects' },
  { name: 'Talent', type: 'multipleSelects' },
  { name: 'Not Relevant?', type: 'checkbox' },
  { name: 'Data Checked?', type: 'checkbox' },
  { name: 'Platform', type: 'singleSelect' },
];

const fieldDefinitions_channel = [
  { name: 'Title', type: 'singleLineText' },
  { name: 'Channel ID', type: 'singleLineText' },
  { name: 'Channel Username', type: 'singleLineText' },
  { name: 'Channel Name', type: 'singleLineText' },
  { name: 'Channel Thumbnail', type: 'multipleAttachments' },
  { name: 'Channel Description', type: 'multilineText' },
  { name: 'Channel Subscribers', type: 'number' },
  { name: 'Channel View Count', type: 'number' },
  { name: 'Channel Total Videos', type: 'number' },
  { name: 'Channel URL', type: 'url' },
  { name: 'Channel Tags', type: 'multipleSelects' },
  { name: 'Channel Country', type: 'singleLineText' },
  { name: 'Channel Creation', type: 'date' },
  { name: 'Last Activity', type: 'date' },
  { name: 'Average Post/Year', type: 'number', precision: 2 },
  { name: 'Average Post/Month', type: 'number', precision: 2 },
  { name: 'Region Code', type: 'singleLineText' },
  { name: 'Format Type', type: 'multipleSelects' },
  { name: 'Themes', type: 'multipleSelects' },
  { name: 'Talent', type: 'multipleSelects' },
  { name: 'Not Relevant?', type: 'checkbox' },
  { name: 'Data Checked?', type: 'checkbox' },
  { name: 'Platform', type: 'singleSelect' },
];

////////////////////////////////////////
////////////// INPUT FORM /////////////
///////////////////////////////////////

output.markdown("# YouTube Data Scraper v" + scriptVersion);

output.markdown(`User Guide: [How to use the YouTube Scraper extension](https://stormideas.atlassian.net/wiki/x/mwBI8) | Last updated: ${scriptLastUpdated}`)

output.markdown("---");
output.markdown("### Selecting the right API for the job!");
output.markdown("**ℹ️ The official API has a quota limit of 10,000 units per day, whereas the unofficial API is unlimited usage, but not supported by Google, so may not always be 100% reliable.**");
output.markdown("To understand quota costs, see the [YouTube API Quota Calculations](https://stormideas.atlassian.net/wiki/x/UADt9Q) page.");

const whatTypeOfAPI = await input.buttonsAsync('Which API do you want to use?', [
  { label: 'Official Google API', value: 'official', variant: 'primary' },
  { label: 'Unofficial 3rd-Party API', value: 'unofficial', variant: 'primary' },
]);

output.markdown(`You have selected the **${whatTypeOfAPI}** API.`);

const whatTypeOfScrape = await input.buttonsAsync('What are you scraping?', [
  { label: 'Videos', value: 'scrapeVids', variant: 'primary' },
  { label: 'Channels', value: 'scrapeChannel', variant: 'primary' },
  //{ label: 'Playlists (coming soon)', value: 'scrapePlaylists', variant: 'default' },
]);

const addTableOrField = await input.buttonsAsync('Do you want to create a new table or add data to an existing table?', [
  { label: 'Create new table', value: 'table', variant: 'primary' },
  { label: 'Add fields to existing table', value: 'fields', variant: 'primary' },
]);

if (addTableOrField === 'table') {
  const tableName = await input.textAsync('Name of table to create');
  //Create Primary Field
  let tableId = await base.createTableAsync(tableName, [
    { name: "Title", type: "singleLineText", options: getFieldTypeOptions("singleLineText"), description: 'Automatically created by YouTube Scraper v' + scriptVersion }
  ])

  output.markdown(`**Created table "${tableName}"**`);
  output.markdown(`Creating table fields...`);

  var table = base.getTable(tableName);

  await createMissingFields(table, whatTypeOfScrape)
    .then(() => {
      output.markdown('Fields created successfully!');
    })
  // .catch((error) => {
  //   console.error('Error creating missing fields:', error);
  // });
  //Add default Single/Multi select options to the table
  const flds = table.fields.filter(f => f.options?.choices)
  await createSelectOptions(table, whatTypeOfScrape);
} else {
  var table = await input.tableAsync('Which table do you want to add fields to?');
  let tableName = base.getTable(table.id);
  await createMissingFields(tableName, whatTypeOfScrape)
    .then(() => {
      output.markdown('Fields created successfully!');
    })
  // .catch((error) => {
  //   console.error('Error creating missing fields:', error);
  // });
  //Add default Single/Multi select options to the table
  await createSelectOptions(table, whatTypeOfScrape);
}



output.markdown(`**How do you want to scrape the YouTube data?**`);

if (whatTypeOfScrape === "scrapeVids") {
  var usePresets = await input.buttonsAsync(
    'Select an option below:',
    [
      { label: 'Scrape by Search Keyword', value: 'preset_search', variant: 'primary' },
      { label: 'Scrape Single/Batch Videos', value: 'preset_video', variant: 'primary' },
      { label: 'Scrape Specific Channel Data', value: 'preset_channel', variant: 'primary' },
      { label: 'Scrape a Predefined Video ID Field', value: 'preset_field', variant: 'primary' },
      //{ label: 'Use Custom Parameters', value: 'preset_no', variant: 'default' },
    ],
  );
}
if (whatTypeOfScrape === "scrapeChannel") {
  var usePresets = await input.buttonsAsync(
    'Select an option below:',
    [
      { label: 'Scrape by Search Keyword', value: 'preset_search', variant: 'primary' },
      { label: 'Scrape a Specific Channel', value: 'preset_channel', variant: 'primary' },
      { label: 'Scrape a Predefined Channel ID Field', value: 'preset_field', variant: 'primary' },
    ],
  );
}

if (usePresets === "preset_field") {
  output.markdown(`⚠️ The table field must contain **only** video or channel IDs or  URLs! ⚠️`);

  // prompt the user to pick a table, then show the number of records in that table:
  let tableSelect = await input.tableAsync('Select the REFERENCE table');
  output.markdown(`Selected reference table: **${tableSelect.name}**.`);

  var selectURLfield = await input.fieldAsync("Select Channel/Video ID Field", tableSelect.name);
  output.markdown(`You picked the **${selectURLfield.name}** field.`);

  let selectView = await input.viewAsync("Select View", tableSelect.name);
  output.markdown(`You picked the **${selectView.name}** view.`);

  // query for all the records in a table 
  let table = base.getTable(tableSelect.id);

  let queryResult = await selectView.selectRecordsAsync({
    fields: [selectURLfield.name],
    sorts: [{ field: selectURLfield.name, direction: "asc" }]
  });

  var ytArray = [];
  if (queryResult.records.length > 50) {
    output.markdown(`⚠️ **Only the first 50 records will be processed from this field.**`)
    output.markdown(`To process more than 50 records, create multiple table columns of 50 and run this scrape on each.`)
  }
  var maxRun = 0;
  for (let record of queryResult.records) {

    let selectedFieldRecord = record.getCellValueAsString(selectURLfield.name);

    if (!selectedFieldRecord) { continue; } //skip blank records

    // Define the regex pattern
    const regexPattern = /(?:v=([\w-]+)|shorts\/([\w-]+))/;

    // Test if the string matches the regex pattern
    const match = selectedFieldRecord.match(regexPattern);

    if (match) {
      // The match array will contain the full match and captured groups
      const videoId = match[1] || match[2];
      // Add the extracted video ID to your array
      ytArray.push(videoId);
    } else {
      ytArray.push(selectedFieldRecord);
    }
    maxRun++;
    if (maxRun > 49) { break; } //stop the loop once 50 records are found
  }
  //console.log(ytArray)

  // Flatten the array to a comma-separated list to send to the API
  var commaSeparatedIDList = ytArray.join(',');

  // If there is a trailing comma, remove it
  var commaSeparatedIDList_final = commaSeparatedIDList.replace(/,$/, '');

  // Decode URL-encoded string
  var decodedString = decodeURIComponent(commaSeparatedIDList_final);

  // Replace encoded commas with actual commas
  var commaSeparatedIDList_final = decodedString.replace(/%2C/g, ',');

}


if (usePresets === 'preset_search' || usePresets === 'preset_video' || usePresets === 'preset_channel' || usePresets === "preset_field") {
  //Use current table
  // var tableId = cursor.activeTableId;
  // var table = base.getTable(tableId);
  //var table = base.getTable(baseTableName.trim());
  //Set generic vars
  var baseTableName = table.name;
  var channelType = "any";
  //var order = "viewCount";
  //var regionCode = "US";

  // if (usePresets === 'preset_search') {
  //   var searchType = await input.buttonsAsync(
  //     'Select Search Type:',
  //     [
  //       { label: 'Videos', value: 'video', variant: 'default' },
  //       { label: 'Channels', value: 'channel', variant: 'default' },
  //       //{ label: 'Playlists', value: 'playlist', variant: 'default' }, //TODO
  //     ],
  //   );
  // } else {
  //   var searchType = "video";
  // }

  if (whatTypeOfScrape === "scrapeChannel") {
    var searchType = "channel";
  }
  if (whatTypeOfScrape === "scrapeVids") {
    var searchType = "video";
  }

  if (usePresets !== "preset_video" && usePresets !== "preset_field" && usePresets !== "preset_channel") {
    var maxResults = await input.textAsync('Number of results required? (Max: 150)');
  } else {
    var maxResults = 50;
  }

  // Convert the string to an integer
  maxResults = parseInt(maxResults, 10);

  // Check if the conversion was successful and maxResults is a number
  if (isNaN(maxResults)) {
    // If not a number, default to 150
    maxResults = 150;

    //Check number isn't too low
    if (maxResults < 5) {
      maxResults = 5; //YouTube API minimum
    }

  }

  output.markdown(`Returning a maximum of **${maxResults}** results.`);

  var regionCode = await input.buttonsAsync(
    'Select a Region:',
    [
      { label: 'US', value: 'US', variant: 'default' },
      { label: 'GB', value: 'GB', variant: 'default' },
    ],
  );

  var order = await input.buttonsAsync(
    'Set Result Order:',
    [
      { label: 'Relevance (default)', value: 'relevance', variant: 'default' },
      { label: 'View Count', value: 'viewCount', variant: 'default' },
      { label: 'Date (new to old)', value: 'date', variant: 'default' },
      { label: 'Rating', value: 'rating', variant: 'default' },
      { label: 'Title (A-Z)', value: 'title', variant: 'default' },
      { label: 'Channel Video Count', value: 'videoCount', variant: 'default' },
    ],
  );

  var safeSearch = await input.buttonsAsync(
    'Set Safe Search Options:',
    [
      { label: 'None', value: 'none', variant: 'default' },
      { label: 'Moderate (default)', value: 'moderate', variant: 'default' },
      { label: 'Strict', value: 'strict', variant: 'default' },
    ],
  );


}
//Set Search specific vars
if (usePresets === 'preset_search') {
  output.markdown(`**This will scrape the first ${maxResults} ${searchType} results based on the ${regionCode} Region, ordered by ${order}, and Safe Search set to ${safeSearch} into the table: "${table.name}"**`);

  var API_URL_TYPE = "search";
  var part = "snippet";
  //Require search terms
  var searchQuery = await input.textAsync('Enter search keywords');
}
//Set Video specific vars
if (usePresets === 'preset_video') {
  output.markdown(`**This will scrape data for an individual video, or a list of defined videos based on the ${regionCode} Region, ordered by ${order}, and Safe Search set to ${safeSearch} into the table: "${table.name}"**`);

  var API_URL_TYPE = "videos";
  var searchQuery = await input.textAsync('Enter Video ID (eg: dQw4w9WgXcQ) or in a batch comma separated list');
  var part = "contentDetails,snippet,statistics,status,id,player";
}
//Set channel specific vars
if (usePresets === 'preset_channel') {
  output.markdown(`**This will scrape the first ${maxResults} ${searchType} results based on the ${regionCode} Region, ordered by ${order}, and Safe Search set to ${safeSearch} into the table: "${table.name}"**`);
  output.markdown('Channel ID must be in a format like this: `UCStzHveCf_orXJ-19kiOUog` and **NOT** a `@handle`. For guidance, see this [help page](https://stormideas.atlassian.net/wiki/x/E4FI8).');

  var API_URL_TYPE = "channels";
  var part = "snippet,brandingSettings,contentDetails,statistics,status,topicDetails,contentDetails";
  //Require search terms
  var searchQuery = await input.textAsync('Enter Channel ID');
}

//Set channel specific vars
if (usePresets === 'preset_field' && whatTypeOfScrape == "scrapeChannel") {
  output.markdown(`**This will scrape the first ${maxResults} ${searchType} results based on the ${regionCode} Region, ordered by ${order}, and Safe Search set to ${safeSearch} into the table: "${table.name}"**`);

  var API_URL_TYPE = "channels";
  var part = "snippet,brandingSettings,contentDetails,statistics,status,topicDetails,contentDetails";
  //Require search terms
  var searchQuery = commaSeparatedIDList_final;
}

//Set channel specific vars
if (usePresets === 'preset_field' && whatTypeOfScrape == "scrapeVids") {
  output.markdown(`**This will scrape the first ${maxResults} ${searchType} results based on the ${regionCode} Region, ordered by ${order}, and Safe Search set to ${safeSearch} into the table: "${table.name}"**`);

  var API_URL_TYPE = "videos";
  var part = "contentDetails,snippet,statistics,status,id,player";
  //Require search terms
  var searchQuery = commaSeparatedIDList_final;
}

//Trim whitespace
searchQuery = searchQuery.trim();

let shouldContinue = await input.buttonsAsync(
  'Start Scraping YouTube?',
  [
    { label: 'Go for it!', value: 'yes', variant: 'primary' },
  ],
);


////////////////////////////////////////
/////////// START THE SCRAPE ///////////
///////////////////////////////////////

if (shouldContinue === 'yes') {

  var capitalizedString = API_URL_TYPE.charAt(0).toUpperCase() + API_URL_TYPE.slice(1);

  if (usePresets === "preset_field") {
    var scrapeForText = selectURLfield.name;
  } else {
    var scrapeForText = searchQuery;
  }

  output.markdown(`## Starting YouTube ${capitalizedString} Scrape for "*${scrapeForText}*"...`);

  //Predefine the variables etc
  if (whatTypeOfAPI === "official") {
    var API_URL_BASE = "https://youtube.googleapis.com/youtube/v3/"; //offical API 10,000 unit quota limit
    var KEY_BASE = "&key=";
    var API_KEY = "AIzaSyC9PSla_H-crThb50B3vz_0nQkzsofTsuc"; //unit3video@gmail.com
    var API_KEY_2 = "AIzaSyD3pE0PsNNmXWLWq1k5eopN6lTsHQfbbHU"; //unit3video@gmail.com (spare key)
  }
  if (whatTypeOfAPI === "unofficial") {
    var API_URL_BASE = "https://yt.lemnoslife.com/noKey/"; //unofficial API no quota limit
    var KEY_BASE = "";
    var API_KEY = ""; // no key required for the unofficial one
  }

  var API_KEY_FULL = KEY_BASE + API_KEY;

  let searchQueryEncoded = encodeURIComponent(searchQuery).trim();

  if (API_URL_TYPE === "search") {
    if (usePresets === 'preset_search') {
      var searchTypeParam = "q";
    }
    if (usePresets === 'preset_channel') {
      var searchTypeParam = "channelId";
    }
  }
  if (API_URL_TYPE === "videos" || API_URL_TYPE === "channels") {
    var searchTypeParam = "id";

    if (searchQuery.endsWith(',')) {
      searchQuery = searchQuery.slice(0, -1); // Remove the last character (comma)
    }
    var videoIDlist = searchQuery.split(',').map(id => `&id=${id.trim()}`).join('');
  }

  var videoIDlist = "";
  if (usePresets === "preset_field" && whatTypeOfScrape === "scrapeChannel") {
    if (API_URL_TYPE === "search") {
      var searchTypeParam = "channelId";
    } else if (API_URL_TYPE === "channels") {
      var searchTypeParam = "id";
    }
    //videoIDlist = `&id=${commaSeparatedIDList_final}`;
    videoIDlist = commaSeparatedIDList_final.split('%2C').map(id => `&id=${id.trim()}`).join('');
  }
  if (usePresets === "preset_field" && whatTypeOfScrape === "scrapeVids") {
    var searchTypeParam = "id";
    //videoIDlist = `&id=${commaSeparatedIDList_final}`;
    videoIDlist = commaSeparatedIDList_final.split('%2C').map(id => `&id=${id.trim()}`).join('');
  }

  //Build API URL
  if (API_URL_TYPE === "search" || API_URL_TYPE === "channels") {
    var API_URL_FULL = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&maxResults=50&order=${order.trim()}&type=${searchType}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&safeSearch=${safeSearch}&maxResults=${maxResults}${API_KEY_FULL}`;
  } else {
    //Single or batch videos
    var API_URL_FULL = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}${videoIDlist}&regionCode=${regionCode.trim()}&safeSearch=${safeSearch}&maxResults=${maxResults}${API_KEY_FULL}`;
  }

  if (debug) {
    output.markdown(`---`);
    output.markdown(`**Debugging API URL TYPE:**`);
    console.info("API TYPE: " + API_URL_TYPE);
    output.markdown(`**Debugging API URL:**`);
    console.info("API URL: " + API_URL_FULL);
  }

  // Get API results page 1 (first 50 results) -- Google limits API response to max 50
  const apiResponse = await fetch(API_URL_FULL); //, { headers });
  const apiResult = await apiResponse.json();
  var skippedDuplicate = 0;

  if (debug) {
    output.markdown(`---`);
    output.markdown(`**Debugging apiResult:**`);
    console.info(apiResult);
  }

  // Check results exist
  if (apiResult.items && apiResult.items.length) {
    //Select table
    const selectedTable = base.getTable(baseTableName.trim()); //The Bear FX  

    //Only do this for search result lists
    if (API_URL_TYPE === "search") {
      //Pagination key for next 50 results
      let nextPageToken = apiResult.nextPageToken;

      if (maxResults > 50) {
        if (nextPageToken) {
          const API_URL_NEXTPAGE = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&type=${searchType}&maxResults=50&order=${order.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&safeSearch=${safeSearch}&pageToken=${nextPageToken}${API_KEY_FULL}`;
          // Get API results page 2 (next 50 results)
          const apiResponseNext = await fetch(API_URL_NEXTPAGE);
          var apiResultNext = await apiResponseNext.json();

          //Pagination key for next 50 results (probably better to loop this in a future update to the code!)
          var nextNextPageToken = apiResultNext.nextPageToken;
        } else {
          var apiResultNext = { items: [] }
        }

        if (nextNextPageToken) {
          const API_URL_NEXT_NEXTPAGE = `${API_URL_BASE.trim()}${API_URL_TYPE.trim()}?part=${part.trim()}&channelType=${channelType.trim()}&type=${searchType}&maxResults=50&order=${order.trim()}&${searchTypeParam}=${searchQueryEncoded}&regionCode=${regionCode.trim()}&safeSearch=${safeSearch}&pageToken=${nextNextPageToken}${API_KEY_FULL}`;
          // Get API results page 3 (next 50 results)
          const apiResponseNextNext = await fetch(API_URL_NEXT_NEXTPAGE);
          var apiResultNextNext = await apiResponseNextNext.json();
        } else {
          var apiResultNextNext = { items: [] }
        }
      } else {
        var apiResultNext = { items: [] }
        var apiResultNextNext = { items: [] }
      }

      //Merge both page results items to get first set of results needed
      const apiResultItemsMerged = [...apiResult.items, ...apiResultNext.items, ...apiResultNextNext.items];

      if (debug) {
        output.markdown(`---`);
        output.markdown(`**Debugging apiResultItemsMerged:**`);
        console.info(apiResultItemsMerged);
      }

      //Filter out any duplicate results
      const originalArray = apiResultItemsMerged;
      const apiResultItemsMergedFiltered = [];
      const encounteredIds = {};

      for (const obj of originalArray) {
        if (searchType === "channel") {
          var id = obj.id.channelId;
        } else {
          var id = obj.id.videoId;
        }
        if (!encounteredIds[id]) {
          apiResultItemsMergedFiltered.push(obj);
          encounteredIds[id] = true;
        } else {
          skippedDuplicate++;
        }
      }
      //console.debug(apiResultItemsMergedFiltered)

      //Join it all back together for iteration...
      //apiResult['items'] = apiResultItemsMerged;
      apiResult['items'] = apiResultItemsMergedFiltered;
    }

    //Loop results to extract data and create table rows
    var imported = 0;
    var skippedPlaylist = 0;
    var skippedVideo = 0;
    var skippedChannel = 0;
    for (let apiResultItems of apiResult.items) {
      //Get statistics for each video with this API call:

      if (debug) {
        output.markdown(`---`);
        output.markdown(`**Debugging apiResultItems:**`);
        console.log(apiResultItems);
      }

      // Get video and channel statistics and merge to search results
      if (API_URL_TYPE === "search" || API_URL_TYPE === "channels") {

        if (searchType === "video") {
          //Skip removed videos to avoid breaking the script 
          if (apiResultItems.id.videoId === "undefined" || apiResultItems.id.videoId === undefined || apiResultItems.id.videoId === "") {
            //console.log("Skipping Removed Video");
            skippedVideo++;
            continue;
          }
        }

        if (searchType === "channel" && API_URL_TYPE === "search") {
          //Skip removed channels to avoid breaking the script 
          if (apiResultItems.id.channelId === "undefined" || apiResultItems.id.channelId === undefined || apiResultItems.id.channelId === "") {
            //console.log("Skipping Removed Video");
            skippedChannel++;
            continue;
          }
        }

        if (searchType !== "playlist") {
          //Skip playlists to avoid breaking the script (they don't all have the same details)
          if (apiResultItems.id.playlistId) {
            //console.log("Skipping playlist");
            skippedPlaylist++;
            continue;
          }
        }

        //Get current iteration video ID
        let videoId = apiResultItems.id.videoId;

        if (searchType === "video") {
          //Get video stats
          var statisticsAPI = `${API_URL_BASE.trim()}videos?part=contentDetails,snippet,statistics,status,id,player&id=${videoId}&regionCode=${regionCode.trim()}&safeSearch=${safeSearch}&maxResults=${maxResults}${API_KEY_FULL}`;
          var apiStatisticsResponse = await fetch(statisticsAPI);
          var apiStatisticsResult = await apiStatisticsResponse.json();

          //console.info(statisticsAPI)
          //console.log(apiStatisticsResult);
        }

        //Get the channel stats
        if (API_URL_TYPE === "search" || API_URL_TYPE === "channels") {
          let channelAPIid = apiResultItems.snippet['channelId'];
          if (!apiResultItems.snippet['channelId']) {
            channelAPIid = apiResultItems.id;
          }
          var channelAPI = `${API_URL_BASE.trim()}channels?part=snippet,brandingSettings,contentDetails,statistics,status,topicDetails,contentDetails&id=${channelAPIid}&safeSearch=${safeSearch}&maxResults=${maxResults}${API_KEY_FULL}`;
          let apiChannelResponse = await fetch(channelAPI);
          var apiChannelResult = await apiChannelResponse.json();
        }

        //Get the latest 10 videos from this channel for stats
        apiResultItems['channelVideos'] = [];
        if (searchType === "channel" && whatTypeOfScrape === "scrapeChannel") {
          let channelAPIid = apiResultItems.snippet['channelId'];
          if (!apiResultItems.snippet['channelId']) {
            channelAPIid = apiResultItems.id;
          }
          let channelVideoAPI = `${API_URL_BASE.trim()}search?part=snippet&channelId=${channelAPIid}&regionCode=${regionCode.trim()}&order=date&safeSearch=${safeSearch}&maxResults=10${API_KEY_FULL}`;
          let apiChannelVidResponse = await fetch(channelVideoAPI);
          var apiChannelVidResult = await apiChannelVidResponse.json();

          if (debug) {
            output.markdown(`---`);
            output.markdown(`**Debugging apiChannelVidResult:**`);
            output.markdown(`<${channelVideoAPI}>`);
            console.info(apiChannelVidResult);
          }
          if (apiChannelVidResult.items?.length) {
            apiResultItems['channelVideos'] = apiChannelVidResult?.items;
          }
        }

        //Merge the arrays
        if (debug) {
          output.markdown(`---`);
          output.markdown(`**Debugging apiChannelResult:**`);
          output.markdown(`<${channelAPI}>`);
          console.info(apiChannelResult);
        }

        if (apiChannelResult.items?.length || API_URL_TYPE === "channels") {
          apiResultItems['channelStatistics'] = apiChannelResult.items[0]?.statistics;
          apiResultItems['brandingSettings'] = apiChannelResult.items[0]?.brandingSettings;
          apiResultItems['brandingSettings']['channel']['customUrl'] = apiChannelResult.items[0]?.snippet.customUrl;
        } else {
          apiResultItems['channelStatistics'] = [];
          apiResultItems['brandingSettings'] = [];
        }

        if (apiStatisticsResult?.items?.length) {
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
          //apiResultItems['channelStatistics'] = [];
        }

        if (debug) {
          output.markdown(`---`);
          output.markdown(`**Debugging apiResultItems:**`);
          console.log(apiResultItems)
        }

        //Extract needed stats
        let title = apiResultItems.snippet['title'];
        let ytVideoId = videoId;

        let videoDurationFormatted = parseDuration(apiResultItems.contentDetails['duration']) ? parseDuration(apiResultItems.contentDetails['duration']) : "00:00";
        let videoDuration = timeToSeconds(videoDurationFormatted);

        //Figure out if its a "short" or not
        if (videoDuration <= 60) {
          var ytURL = `https://www.youtube.com/shorts/${videoId}`;
          var contentType = { name: "Short" }
        } else {
          var ytURL = `https://www.youtube.com/watch?v=${videoId}`;
          var contentType = { name: "Video" }
        }

        let viewCount = parseInt(apiResultItems.videoStatistics['viewCount']) ? parseInt(apiResultItems.videoStatistics['viewCount']) : 0;
        let likeCount = parseInt(apiResultItems.videoStatistics['likeCount']) ? parseInt(apiResultItems.videoStatistics['likeCount']) : 0;
        let commentCount = parseInt(apiResultItems.videoStatistics['commentCount']) ? parseInt(apiResultItems.videoStatistics['commentCount']) : 0;

        if (searchType === "channel") {
          var description = apiResultItems.snippet.description ? apiResultItems.snippet.description : "";
        } else {
          var description = apiResultItems.videoDescription ? apiResultItems.videoDescription : "";
        }
        let publishedDate = apiResultItems.snippet['publishedAt'];
        let tags = apiResultItems.videoTags;
        let tagsArray = apiResultItems.videoTags;
        if (tagsArray === undefined || tagsArray === "undefined" || typeof tagsArray === undefined) {
          //Workaround if a video has no tags on it to stop other functions from breaking
          tagsArray = [];
        }
        //console.log(tags)
        if (tags !== undefined) {
          tags = tags.toString(); //flatten array
        }
        let definition = apiResultItems.contentDetails?.definition?.toUpperCase();
        //let embedVideo = apiResultItems.embedVideo; //iframe code
        //let thumbnailHighRes = [{ url: apiResultItems.snippet.thumbnails.high['url'] }];
        //let thumbnailHighRes = [{ url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` }];

        let channelMainID = apiResultItems.snippet['channelId'];
        if (!apiResultItems.snippet['channelId']) {
          channelMainID = apiResultItems.id;
        }
        let channelTitle = apiResultItems.snippet.channelTitle;
        if (!apiResultItems.snippet.channelTitle) {
          channelTitle = apiResultItems.snippet.title;
        }
        let subscriberCount = parseInt(apiResultItems.channelStatistics.subscriberCount);
        let channelViewCount = parseInt(apiResultItems.channelStatistics.viewCount);
        let videoCount = parseInt(apiResultItems.channelStatistics.videoCount);
        if (apiResultItems.brandingSettings.channel?.description) {
          var channelDesc = apiResultItems.brandingSettings.channel.description;
        } else {
          var channelDesc = apiResultItems.snippet.description;
        }
        let lastActivity = apiResultItems.channelVideos?.[0]?.snippet.publishedAt;

        //Get video dates for cadence
        const channelVideos = apiResultItems.channelVideos;
        var videoPublishDatesArray = [];
        if (apiResultItems.channelVideos?.length) {
          // Loop through the channelVideos array
          for (let i = 0; i < channelVideos.length; i++) {
            // Check if the video object has a snippet property and publishedAt within it
            if (channelVideos[i].snippet && channelVideos[i].snippet.publishedAt) {
              // Extract the publishedAt date and push it to the videoPublishDatesArray
              videoPublishDatesArray.push(channelVideos[i].snippet.publishedAt);
            }
          }
        }

        var cadence = calculatePostingCadence(videoPublishDatesArray);

        let channelLoc = apiResultItems.brandingSettings.channel?.country;
        let channelCustomUrl = apiResultItems.brandingSettings.channel?.customUrl;
        if (channelCustomUrl) {
          var ytChannelURL = `https://www.youtube.com/${channelCustomUrl}`;
        } else {
          var ytChannelURL = `https://www.youtube.com/channel/${channelMainID}`;
        }
        let platform = { name: "YouTube" };

        //Find best thumbnail quality
        let thumbnailArray = [];

        thumbnailArray.push({ url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` });


        for (let vidThumbs in apiResultItems.snippet.thumbnails) {
          switch (vidThumbs) {
            case "maxres":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.maxres['url'] });
              break;
            case "high":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.high['url'] });
              break;
            case "standard":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.standard['url'] });
              break;
            case "medium":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.medium['url'] });
              break;
            case "default":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.default['url'] });
              break;
            default:
              thumbnailArray.push({ url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` });
          }
        }

        //Finally, create all the records in the AirTable :)
        //Get channel info
        if (searchType === "channel" || API_URL_TYPE === "channels") {

          //Convert tags into multiselect choices
          let newTags = await generateTagChoices(table, "Channel Tags", tagsArray);
          //Update tags array to the correct format for Airtable
          let convertedTags = convertTagsArray(tagsArray);

          let publishTime = apiResultItems.snippet.publishTime;
          //Finally, create all the records in the AirTable :)
          var recordIds = await selectedTable.createRecordsAsync([
            {
              fields:
              {
                'Title': title,
                'Channel ID': channelMainID,
                'Channel Name': channelTitle,
                'Channel Username': channelCustomUrl,
                'Channel Thumbnail': thumbnailArray,
                'Channel Description': channelDesc,
                'Channel Subscribers': subscriberCount,
                'Channel View Count': channelViewCount,
                'Channel Total Videos': videoCount,
                'Channel URL': ytChannelURL,
                //'Channel Tags': convertedTags, //Can't get them from API for channels
                'Channel Country': channelLoc,
                'Channel Creation': publishTime,
                'Last Activity': lastActivity,
                'Average Post/Year': parseFloat(cadence.postsPerYear),
                'Average Post/Month': parseFloat(cadence.postsPerMonth),
                'Region Code': regionCode.trim(),
                //'Format Type': '',
                //'Themes': '',
                //'Talent': '',
                //'Not Relevant?': '',
                //'Data Checked?': '',
                'Platform': platform,
              },
            }
            ,]);
        } else {

          //Convert tags into multiselect choices
          let newTags = await generateTagChoices(table, "Video Tags", tagsArray);
          //Update tags array to the correct format for Airtable
          let convertedTags = convertTagsArray(tagsArray);

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
                'Content Type': contentType,
                'Video Tags': convertedTags,
                'Video Definition': definition,
                //'Video Embed Code': embedVideo,
                'Video Thumbnail': thumbnailArray,
                'Channel ID': channelMainID,
                'Channel Name': channelTitle,
                'Channel Description': channelDesc,
                'Channel Subscribers': subscriberCount,
                'Channel View Count': channelViewCount,
                'Channel Total Videos': videoCount,
                'Channel URL': ytChannelURL,
                'Channel Country': channelLoc,
                //'Last Activity': '',
                'Platform': platform,
              },
            }
            ,]);
        }
      } //end search logic


      //Single video -- some of the returned arrays differ slightly from the main search list
      if (API_URL_TYPE === "videos") {
        //For search result statistics    
        //console.log("Amending search items array!");

        let videoId = apiResultItems.id;

        //Get video stats
        let statisticsAPI = `${API_URL_BASE.trim()}videos?part=contentDetails,snippet,statistics,status,id,player&id=${videoId}&regionCode=${regionCode.trim()}&maxResults=${maxResults}${API_KEY_FULL}`;
        let apiStatisticsResponse = await fetch(statisticsAPI);
        let apiStatisticsResult = await apiStatisticsResponse.json();

        //Get the channel stats
        let channelAPI = `${API_URL_BASE.trim()}channels?part=statistics&id=${apiResultItems.snippet['channelId']}&maxResults=${maxResults}${API_KEY_FULL}`;
        let apiChannelResponse = await fetch(channelAPI);
        let apiChannelResult = await apiChannelResponse.json();

        //Get the latest 10 videos from this channel for stats
        apiResultItems['channelVideos'] = [];
        if (whatTypeOfScrape === "scrapeChannel") {
          let channelVideoAPI = `${API_URL_BASE.trim()}search?part=snippet&channelId=${apiResultItems.snippet['channelId']}&regionCode=${regionCode.trim()}&order=date&safeSearch=${safeSearch}&maxResults=10${API_KEY_FULL}`;
          let apiChannelVidResponse = await fetch(channelVideoAPI);
          var apiChannelVidResult = await apiChannelVidResponse.json();

          if (debug) {
            output.markdown(`---`);
            output.markdown(`**Debugging apiChannelVidResult:**`);
            console.info(apiChannelVidResult);
          }
          if (apiChannelVidResult.items?.length) {
            apiResultItems['channelVideos'] = apiChannelVidResult?.items;
          }
        }

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


        //Extract needed stats
        let title = apiResultItems.snippet['title'];
        let ytVideoId = apiResultItems.id;

        let videoDurationFormatted = parseDuration(apiResultItems.contentDetails['duration']) ? parseDuration(apiResultItems.contentDetails['duration']) : "00:00";
        let videoDuration = timeToSeconds(videoDurationFormatted);

        //Figure out if its a "short" or not
        if (videoDuration <= 60) {
          var ytURL = `https://www.youtube.com/shorts/${videoId}`;
          var contentType = { name: "Short" }
        } else {
          var ytURL = `https://www.youtube.com/watch?v=${videoId}`;
          var contentType = { name: "Video" }
        }

        let viewCount = parseInt(apiResultItems.statistics['viewCount']) ? parseInt(apiResultItems.statistics['viewCount']) : 0;
        let likeCount = parseInt(apiResultItems.statistics['likeCount']) ? parseInt(apiResultItems.statistics['likeCount']) : 0;
        let commentCount = parseInt(apiResultItems.statistics['commentCount']) ? parseInt(apiResultItems.statistics['commentCount']) : 0;
        let description = apiResultItems.snippet.description;
        let publishedDate = apiResultItems.snippet['publishedAt'];
        let tags = apiResultItems.snippet.tags;
        let tagsArray = apiResultItems.snippet.tags;
        if (tagsArray === undefined || tagsArray === "undefined" || typeof tagsArray === undefined) {
          //Workaround if a video has no tags on it to stop other functions from breaking
          tagsArray = [];
        }
        if (tags !== undefined) {
          tags = tags.toString(); //flatten array
        }
        let definition = apiResultItems.contentDetails.definition.toUpperCase();
        let embedVideo = apiResultItems.player.embedHtml; //iframe code
        let channelMainID = apiResultItems.snippet['channelId'];
        let channelTitle = apiResultItems.snippet['channelTitle'];
        let subscriberCount = parseInt(apiResultItems.channelStatistics.subscriberCount);
        let channelViewCount = parseInt(apiResultItems.channelStatistics.viewCount);
        let videoCount = parseInt(apiResultItems.channelStatistics.videoCount);
        let ytChannelURL = `https://www.youtube.com/channel/${channelMainID}`;
        let platform = { name: "YouTube" };

        //Find best thumbnail quality
        let thumbnailArray = [];
        thumbnailArray.push({ url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` });

        for (let vidThumbs in apiResultItems.snippet.thumbnails) {
          switch (vidThumbs) {
            case "maxres":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.maxres['url'] });
              break;
            case "high":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.high['url'] });
              break;
            case "standard":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.standard['url'] });
              break;
            case "medium":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.medium['url'] });
              break;
            case "default":
              thumbnailArray.push({ url: apiResultItems.snippet.thumbnails.default['url'] });
              break;
            default:
              thumbnailArray.push({ url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` });
          }
        }

        //Convert tags into multiselect choices
        let newTags = await generateTagChoices(table, "Video Tags", tagsArray);
        //Update tags array to the correct format for Airtable
        let convertedTags = convertTagsArray(tagsArray);

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
              'Content Type': contentType,
              'Video Tags': convertedTags,
              'Video Definition': definition,
              //'Video Embed Code': embedVideo,
              'Video Thumbnail': thumbnailArray,
              'Channel ID': channelMainID,
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


      if (debug) {
        output.markdown(`---`);
        output.markdown(`**Debugging apiResultItems:**`);
        console.debug(apiResultItems);
      }
      imported++;
    } //end loop

    //console.log("Success!");
    output.markdown(`## Success!`);
    output.markdown(`## Results:`);
    output.markdown(`* ${imported} imported video data`);
    output.markdown(`* ${skippedDuplicate} duplicate results skipped`);
    output.markdown(`* ${skippedPlaylist} skipped playlists`);
    output.markdown(`* Skipped ${skippedVideo} removed/unavailable videos`);
    output.markdown(`* Skipped ${skippedChannel} removed/unavailable channels`);

  } else { //end array check
    if (apiResult.error) {
      console.log(apiResult.error)
      let errorReason = apiResult.error.errors[0]?.reason;
      let errorMessage = apiResult.error.message;
      let errorMessageNoTags = errorMessage.replace(/<[^>]*>/g, '');
      output.markdown(`---`);
      console.error(`Error ${errorReason} (${apiResult.error.code})
      ${errorMessageNoTags}`);
      output.markdown(`Learn more about the API quota limitations and costs [here](https://developers.google.com/youtube/v3/determine_quota_cost)`);
    }
  }

} //end button logic
