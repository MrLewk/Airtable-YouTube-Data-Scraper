# How to use the YouTube Scraper Extension

**Last Updated:** March 22, 2024

**Author:** Luke Wilson

## 1. Go to an Airtable base you need import YouTube data to.

If you haven't installed the extension, install the Scripting extension and copy the code from here into that.

## 2. Click on Extensions

## 3. Find the \"YouTube Scraper\" extension and click on \"Run\"

This will load the script interface. If the extension can\'t be found,
contact a base admin to install it.

## 4. Selecting the best API to use

There is now a choice between using the official Google API to gather
YouTube data, or an unofficial 3rd-party API. The difference between
these comes down to limitations on the API results.

Google imposes a limit of 10,000 "units" per 24 hours on their API
calls. Units are defined differently depending on what results you want.
See this page for more details: https://developers.google.com/youtube/v3/determine_quota_cost

The [**unofficial API**](https://yt.lemnoslife.com/) has
no restrictions currently, though the author of the code says they may
add a "future limitation per IP", so that's something to bear in mind.
This API works based on an open-source model where it is powered by 2455
shared keys to ensure you'll never hit the quota limit from Google.

Whichever API you use will bring in the same results from YouTube.

## 5. Selecting what you want to scrape

There are two options currently to scrape: **videos** or **channels**
(playlists will also come later). Each option will present you with some
different configuration options to choose from.

## 6. Table creation or updating options

Both of the above options will present you with first with the same
question about table setup/creation.

### 6.1. Click on \"Create new table\" if you need to make a fresh one and give it a name. This will also pre-populate the table with the required fields for the scraper to fill in.

### 6.2. Or you can click on \"Add fields to existing table\" if you already have a table you want to amend. This will still automatically create the necessary fields for the scraper in the selected table.

This will present you with a drop-down menu to select from existing
tables in the current base.

## 7. You will then see a choice on how you want to scrape the YouTube data into the Airtable.

### 7.1. Options for the Video scraping

-   **\"Scrape by Search Keyword\"** -- this will search YouTube for all
    > results found under the specified keyword(s) and scrape all video
    > results.

-   **\"Scrape Single/Batch Videos\"** -- this will let you scrape all
    > the data for a single video by its YouTube video ID (eg:
    > dQw4w9WgXcQ). Or you can specify multiple video IDs, comma
    > separated (e.g.: \_\_R6Wwn0ja0, \_\_Xor_RqWug, \_-2RZ8qb7tY,
    > \_0BxnWSU8nQ, \_0YyNfG4qFQ).

-   **\"Scrape Specific Channel Data\"** -- this will return all results
    > from a YouTube channel, specified by its channel ID (e.g.:
    > UCStzHveCf_orXJ-19kiOUog) and NOT a \@handle.

-   **\"Scrape a Predefined Video ID Field"** -- this option will
    > present you with options to select an existing table within the
    > base, and also to select a field within that table that has Video
    > IDs in it, so you can scrape in large batches from pre-existing
    > data.

### 7.2. Options for the Channel scraping

-   **\"Scrape by Search Keyword\"** -- this will search YouTube
    > channels by the specified keyword and scrape all channel
    > information results.

-   **\"Scrape Specific Channel\"** -- this will return all videos
    > uploaded to a YouTube channel, specified by its channel ID (e.g.:
    > UCStzHveCf_orXJ-19kiOUog) and NOT a \@handle.

-   **\"Scrape a Predefined Channel ID Field"** -- this option will
    > present you with options to select an existing table within the
    > base, and also to select a field within that table that has
    > Channel IDs in it, so you can scrape in large batches from
    > pre-existing data.

## 8. Scrape by Search Keyword options

If you are using the official API, the search option uses [**[100
units]{.underline}**](file:///C:/wiki/spaces/CO/pages/4125950032/YouTube+API+Quota+Calculations)
per set of results. This is the costliest endpoint of the API.

### 8.1. Click on \"Scrape by Keyword\"

You will be presented with some options to configure first to set up the
search:

-   Number of results required (max 150)

-   The video results region

-   The search result list order

-   Safe Search options

### 8.2. Entering the keyword(s)

Once you have set the search parameters, it will tell you what your
settings are and ask for the keywords you want to search for videos by.

If you make a mistake and need to change some of the settings, you will
need to stop the script and run it again to reset it.

**Continue down to [point number 12](#12-starting-the-video-or-channel-scraping)**

## 9. Scrape Single/Batch Videos option

This option is only available when scraping for videos

### 9.1. Click on \"Scrape Single/Batch Videos\"

You will be presented with some options to configure first to set up the
search:

-   The video results region

-   The search result list order

-   Safe Search options

### 9.2. Entering the video ID(s)

Once you have set the scrape parameters, it will tell you what your
settings are and ask for the video ID(s) that you want to scrape. This
option allows for single a YouTube video ID, or for a comma separated
list of IDs up to a maximum of **50**.

If you make a mistake and need to change some of the settings, you will
need to stop the script and run it again to reset it.

**Continue down to [point number 12](#12-starting-the-video-or-channel-scraping)**

## 10. Scrape a Channel option

If scraping for videos, this will find all video uploaded by a channel;
if scraping for channels, this will return the meta data about a
channel.

### 10.1. Click on \"Scrape a Specific Channel\" or \"Scrape Specific Channel Data\" (depending on your previous choices)

You will be presented with some options to configure first to set up the
search:

-   The video results region

-   The search result list order

-   Safe Search options

### 10.2. Entering the Channel ID

Once you have set the scrape parameters, it will tell you what your
settings are and ask for the Channel ID that you want to scrape videos
from. This option **only** allows for single a YouTube channel ID at a
time.

Please note that this method **requires** a channel ID (e.g.:
UCStzHveCf_orXJ-19kiOUog) and not the new \@username format of YouTube
channel names. To see how to get a channel ID, read this quick guide:

If you make a mistake and need to change some of the settings, you will
need to stop the script and run it again to reset it.

**Continue down to [point number 12](#12-starting-the-video-or-channel-scraping)**

## 11. Scrape a Predefined Video/Channel ID Field option

### 11.1. Click on \"Scrape a Predefined Video ID Field\" or \"Scrape a Predefined Channel ID Field\" (depending on your previous choices)

You will be presented with the following options to select the relevant
table and reference fields to grab existing data from.

### 11.2. Choose your reference table where the existing video or channel IDs reside

### 11.3. Next select the field where the Video/Channel IDs or YouTube URLs are stored

### 11.4. Finally, select a relevant View, if you have one set up

Clicking the "Next" button here will begin the video scraping.

**Continue down to [point number 12](#12-starting-the-video-or-channel-scraping)**

## 12. Starting the Video or Channel Scraping

Clicking on the "Next" button will present you with a button to confirm
everything and begin the scraper. Some options will start the scrape
immediately after selecting the last choice presented to you, without
displaying the "Go for it!" button.

### 12.1. The table will begin to populate automatically row by row as it finds the results from the search query.

### 12.2. Once the scrape has finished, you\'ll be presented with the results so you can see exactly how many videos you imported, and what might have been skipped.

## 13. See Also...

### 13.1. Adding the YouTube Scraper to an Airtable Base

For a guide on how to add the YouTube scraper to a base which doesn't
already have it, see:

[[Add the YouTube Scraper to an Airtable
base]{.underline}](file:///C:/wiki/spaces/CO/pages/4046684174/Add+the+YouTube+Scraper+to+an+Airtable+base)

### 13.2. Finding YouTube Channel IDs

[[How to Find a YouTube Channel
ID]{.underline}](file:///C:/wiki/spaces/CO/pages/4031283475/How+to+Find+a+YouTube+Channel+ID)

### 13.3. Reporting any bugs or requesting features

If you find a bug or error with the scraper, or if you have any
suggestions, please leave a comment on this page:

[[YouTube Scraper Master
Codebase]{.underline}](file:///C:/wiki/spaces/CO/pages/4046290969/YouTube+Scraper+Master+Codebase)
