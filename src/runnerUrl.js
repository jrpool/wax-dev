const {apiUrl}= require('./utils/api.js');

const runner = function (code, options) {
  let config = {};
  if (!options && !options?.apiKey) {
    const readUserConfig = require('./utils/config.js');
    config = readUserConfig();
  } else {
    config = options;
  }
  if (!config.apiKey || !config.apiKey.length) {
    throw new Error(
      'API Key is required to run wax-dev. Please reach out to https://account.wallyax.com/ to get your API Key.'
    );
  }
  return new Promise((resolve, reject) => {
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${config.apiKey}`,
      },
      body: JSON.stringify({ url: code }),
    })
      .then((response) => response.json())
      .then((data) => {
        const cleanedIssues = data.issues.map((item) => {
          const {
            code,
            type,
            message,
            context,
            selector,
            component,
            issue_category_name,
          } = item;
          const groupData = item.groupData || {};

          const cleanedItem = {};

          if (type) cleanedItem.type = type;
          if (message) cleanedItem.message = message;
          if (context) cleanedItem.context = context;
          if (selector) cleanedItem.selector = selector;
          if (groupData?.why_issue) cleanedItem.impact = groupData.why_issue;
          if (groupData?.what_is_missing) cleanedItem.what_is_missing = groupData.what_is_missing;
          if (groupData?.how_to_solve) cleanedItem.how_to_fix = groupData.how_to_solve;
          if (groupData?.example_before) cleanedItem.example_before = groupData.example_before;
          if (groupData?.example_after) cleanedItem.example_after = groupData.example_after;
          if (code) cleanedItem.code = code.split('_')[0].split(',')[0];


          return cleanedItem;
        });

        resolve({
          documentTitle: data.documentTitle,
          pageUrl: data.pageUrl,
          issues: cleanedIssues
        });
      })
      .catch((error) => reject(error));
  });
};

module.exports = runner;
