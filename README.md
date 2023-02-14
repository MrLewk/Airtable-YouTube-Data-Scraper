# Airtable-YouTube-Data-Scraper
Scrape YouTube data directly into an Airtable base

# [How to use the YouTube Scraper Extension](https://app.tango.us/app/workflow/aaa9406c-0786-4818-a633-84f0cd5486e2?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)



__Date:__ February 13, 2023

__Author:__ Katrina Davies

__Source:__ [Tango](https://app.tango.us/app/workflow/aaa9406c-0786-4818-a633-84f0cd5486e2?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)

***

### 1. Go to an Airtable base you need import YouTube data to.


### 2. Click on Extensions
![Step 2 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/64fef455-1616-4e1f-8c2c-0fbecfd66801/649d1dc4-9963-4280-b886-39bff8e6fdda.png?crop=focalpoint&fit=crop&fp-x=0.9044&fp-y=0.1499&fp-z=3.0111&w=1200)


### 3. Find the "YouTube Scraper" extension and click on "Run"
This will load the script interface. If the extension can't be found, contact a manager to install it.
![Step 3 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/a1d5679c-817d-420b-b9f7-009405c08e06/bd2c34b4-e007-4bbc-a142-bfd567cf7311.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200)


### 4. Click on "Create new table" if you need to make a fresh one, and give it a name
![Step 4 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/d731ec65-12e6-41fa-a5e4-8d04d445526f/a685e331-f3c5-4e67-abb8-0562e7337d48.png?crop=focalpoint&fit=crop&fp-x=0.8029&fp-y=0.4646&fp-z=2.7058&w=1200)


### 5. Or you can click on "Add fields to existing table"
This will present you with a drop down menu to select from existing tables in the current base.
![Step 5 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/2c0cc182-a33a-41b5-9873-ac38cc8d15d6/f0b83a42-edb3-458a-811a-0ba09c8cdf54.png?crop=focalpoint&fit=crop&fp-x=0.8193&fp-y=0.4577&fp-z=2.7642&w=1200)


### 6. Whether you select "Create new table" or "Add fields to existing table" the script will populate the table with all the fields necessary for the YouTube data.
![Step 6 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/f5d641b2-cc55-420e-86a5-ef460da8fa16/14f709b5-d567-49ff-8e5e-a600efcf2a2b.png?crop=focalpoint&fit=crop&fp-x=0.8365&fp-y=0.5460&fp-z=3.1981&w=1200)


### 7. You will then see a choice on how you want to scrape the YouTube data into the Airtable.
*   **"Search Presets"** will default to the US Region and filter the results by "View Count".
    
*   **"Single Video Preset"** will let you scrape all the data for a single video by its YouTube video ID (eg: _dQw4w9WgXcQ_).
    
*   **"Custom Parameters"** will let you enter each parameter for the API manually via inputs. Recommend for more advanced users. See the [YouTube API Docs](https://developers.google.com/youtube/v3/docs/search/list) for more information on the parameters.
![Step 7 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/173b0ed1-ed7d-451d-b9fd-d2879c1a56e9/a0fccfd1-dc8f-4675-a504-5256b015a5ce.png?crop=focalpoint&fit=crop&fp-x=0.8282&fp-y=0.5637&fp-z=3.1981&w=1200)


### 8. Click on "Use Search Presets"
This will open a new input where you can type in the word or phrase you want to search YouTube for.
![Step 8 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/09787e94-c73a-427a-a227-bd70156dd636/423c0d7e-beed-4191-b0c3-c67ee6631de7.png?crop=focalpoint&fit=crop&fp-x=0.7410&fp-y=0.5687&fp-z=2.9754&w=1200)


### 9. Click on "Go for it!" to begin the scrape
![Step 9 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/27f6ee7d-5283-46a1-bff3-ca5f4a9e8d36/d4b8dc10-edcf-47f1-91c8-4c68839139f8.png?crop=focalpoint&fit=crop&fp-x=0.7470&fp-y=0.6365&fp-z=3.9443&w=1200)


### 10. The table will begin to populate automatically row by row as it finds the results from the search query.
![Step 10 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/8022f17e-fab2-4682-b4c7-2749db511ca2/549d979f-aa9c-49a8-8fb1-8b160019c4e3.png?crop=focalpoint&fit=crop&fp-x=0.4477&fp-y=0.4163&fp-z=1.8620&w=1200)


### 11. Once the scrape has finished, you'll be presented with the results so you can see exactly how many videos you imported, and what might have been skipped.
![Step 11 screenshot](https://images.tango.us/workflows/aaa9406c-0786-4818-a633-84f0cd5486e2/steps/fe6bc2e1-cc76-472d-9342-9c1c507b6bb0/4de5e2a9-c41d-42d0-b2d2-485b78d27e7a.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200)


### 12. Repeat the process as required.
Scraping data into an existing table will append the data to the end of any existing rows. Nothing will be overwritten.


***
_[This Workflow was created with Tango](https://app.tango.us/app/workflow/aaa9406c-0786-4818-a633-84f0cd5486e2?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)_
