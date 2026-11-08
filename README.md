# WorkoutPlanMaker

## 新手先看：本地使用与上线

这是一个新网站，请上传到新建的 **workoutplanmaker** 仓库，不要覆盖 PicUplift。

1. 双击“WorkoutPlanMaker-20261108-完整网站.zip”解压，打开解压后的文件夹。
2. 确认里面直接能看到 index.html、macro-calculator.html、privacy-policy.html 和 assets 文件夹。不要把文件拆散。
3. 先双击 index.html，用 Chrome 或 Edge 打开。点 Start Your Assessment；数字输入后点 Save，选择题点选项后继续。完成八题可查看计划；Print / Save PDF 打开打印窗口，目标选择“另存为 PDF”。直接打开文件时装饰动画可能不播放，计算功能可用。
4. 要上线时，打开 https://github.com，登录已有的 yyu447672-tech 账号。
5. 点右上角“+” → New repository。Owner 选 yyu447672-tech；Repository name 填 workoutplanmaker；选 Public。暂时不要勾选自动创建 README，点 Create repository。
6. 在新仓库页面点 uploading an existing file。如果仓库已经建好，就点 Add file → Upload files。
7. 回到解压文件夹，选中**里面全部内容**，拖进 GitHub 上传区。assets、licenses 文件夹和它们的子文件必须一起上传。不要上传 ZIP，也不要多套一层文件夹；测试报告和验收资料不上传。
8. 等文件列表显示完整，在 Commit changes 输入 Initial WorkoutPlanMaker site。如果显示分支选项，选 Commit directly to the main branch，再点 Commit changes。
9. 回到 Code 页，确认 index.html 就在最外层。点进 assets，确认 app.js、core.js、content.js、data.js、style.css 和其他子文件夹都在。
10. 点仓库上方 Settings → 左侧 Pages（位于 Code, planning, and automation 分组附近）。
11. 在 Build and deployment 下，Source 选 **Deploy from a branch**。
12. Branch 必须选 **main**，不能停在 **None**；旁边文件夹选 **/ (root)**，点 Save。
13. 点上方 Actions，等 Pages 的发布任务显示绿色勾。首次发布可能需要几分钟；如果红色失败，点进去看错误步骤。
14. 回到 Settings → Pages，点 Visit site。预计地址为 https://yyu447672-tech.github.io/workoutplanmaker/ 。
15. 在线重新走一次八题，检查 Macro Calculator、Privacy Policy 和打印；用手机再打开试一次。没有真实手机测试的项目请以你的设备验收为准。
16. 以后更新，向同一仓库上传变动文件并提交到 main，等 Actions 绿色后刷新网站。

已按本轮要求配置真实统计 ID G-KC5CFCJXPC；contact@example.com 仍是待替换的联系邮箱。未购买域名时不用填写 Custom domain。当前交付没有替你创建仓库或上线。后文是技术边界与英文详细说明。

Free static fitness-assessment and macro-calculator website. No framework, npm install, build or backend. English interface; all product copy in assets/content.js, with the exact Chinese minor notice in common.zh; the rest of the interface remains English. Supplied WorkoutPlanMaker F logo and favicons are preserved.

## Local use

1. Extract the complete website ZIP to a folder.
2. Keep index.html, macro-calculator.html, privacy-policy.html and assets together, with the directory structure intact.
3. Double-click index.html in a current desktop Chrome or Edge browser. Core assessment and calculations work locally. Module-based decorative motion may remain static under file://.
4. Click Start Your Assessment, or enter an age in the live first-question window. Numeric questions use a save button or Enter; option questions continue immediately when selected. Use Previous question to edit.
5. Complete the eight answers to see the results. Print / Save PDF opens your browser's print dialog; choose Save as PDF to retain a local file.
6. Macro Calculator is always available in the top navigation. Direct-calorie mode still needs body weight and goal because this tool uses grams-per-kilogram formulas. Estimated-calorie mode additionally needs age, formula sex, height and activity.

Only the tool's in-memory state holds answers. No localStorage, sessionStorage, cookies or URL parameters are used for fitness inputs. Page reloads/navigation discard the current answers. Print files are managed by your browser/device.

## Upload to GitHub Pages, step by step

Use the existing yyu447672-tech account; no domain purchase is required.

1. Sign in to github.com. Click the + button at the top right, then New repository.
2. Under Owner select yyu447672-tech. Enter workoutplanmaker in Repository name. Choose Public. You may leave Description blank. Click Create repository. If this repository already exists, open it and upload into its root instead of creating another.
3. On the repository Code page, click uploading an existing file (on an empty repository), or Add file → Upload files.
4. Open the extracted website folder on your computer. Drag its CONTENTS into the upload area: the three HTML files, assets and licenses folders, README.md, sitemap.xml, robots.txt and llms.txt. Do not upload the ZIP itself or an extra outer folder. Do not upload the separate QA report, screenshots or browser profiles.
5. Wait until all files appear in the upload list. Enter Initial WorkoutPlanMaker site in Commit changes. Select Commit directly to the main branch if shown. Click Commit changes.
6. Check the Code page: index.html should be visible directly in the repository root, alongside assets. Open assets and confirm the nested motion/layout/ui/moments folders were also uploaded.
7. Click Settings in the repository menu. In the left sidebar click Pages, under Code and automation.
8. Under Build and deployment, set Source to Deploy from a branch.
9. Under Branch, SELECT main. Do not leave None: None does not trigger deployment. In the folder selector choose / (root). Click Save.
10. Open the Actions tab. Wait until the Pages build/deployment run has a green check. If it fails, open the failed run and read the failing step before re-uploading.
11. Return to Settings → Pages. Click Visit site. Expected URL: https://yyu447672-tech.github.io/workoutplanmaker/ . A first deployment can take a few minutes.
12. Test the assessment, Macro Calculator and Privacy Policy links. Complete a fresh assessment and try Print / Save PDF. On a phone, check the navigation and the calculator fields too.
13. For an update, upload changed files to the same repository paths, commit to main, wait for the next green deployment, then reload the page. A forced reload may be needed for cached scripts.

This delivery has not created a repository, pushed commits or deployed on your behalf.

The Pages settings sequence was checked against the [GitHub documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). The sidebar group may read Code, planning, and automation depending on the current GitHub interface.

This is a project site under /workoutplanmaker/. Its included robots.txt is shipped for later domain deployment; crawlers read robots.txt at the HOST root, not inside a project subdirectory. Until you use a custom domain or control yyu447672-tech.github.io/robots.txt, submit the project sitemap directly in Search Console and do not assume the project's AI-crawler rules are enforced. See [Google's file-location rules](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

## Analytics configuration and a future custom domain

- assets/content.js contains the real Measurement ID G-KC5CFCJXPC. The existing Google tag loads on HTTP(S); it remains disabled for file://. The Measurement ID is a public website identifier, not a private credential. FAQ and privacy disclosures reflect this configuration.
- Custom events: quiz_start, quiz_complete, plan_print_click, macro_calculate. Each sends only a fixed tool string, never age, weight, sex, dimensions, calorie targets, body measurements or raw errors. Download/print events mean the action was requested, not proof the user saved a file.
- Google Analytics is configured. The privacy page describes its visit/interaction data; review your consent approach for the audience you serve. Analytics may collect standard page/interaction data independently of the custom events. Do not add fitness inputs to event parameters or URL query strings.
- Replace contact@example.com with a real contact address before launch. The .example address is an explicitly supplied placeholder, not a working support contact.
- Canonicals intentionally use self-relative paths until a domain is chosen. Sitemap and llms.txt use the specified GitHub Pages URL. If the repository/user/path changes, update both files. When a custom domain is actually bound, replace canonicals, sitemap, llms and share URLs consistently; no domain purchase is part of this delivery.

## Calculations and boundaries

BMR uses the specified Mifflin–St Jeor approximation; TDEE uses activity factors1.2/1.375/1.55/1.725. Calorie adjustments and protein/fat g/kg coefficients are the project's fixed planning assumptions, not validated individual medical prescriptions. Carbohydrate receives residual calories. Grams are rounded, percentages use raw values, and three-meal splits preserve daily displayed totals.

The arithmetic accepts bounded inputs and explains invalid or negative-carbohydrate combinations. Extremely low calculated targets and a requested fat-loss plan in the underweight adult BMI range are not presented as prescriptive plans. Templates match days/equipment but do not assess injuries, movement ability or training experience. Bodyweight floor back exercises have limited resistance compared with rows or pulldowns.

The assessment accepts ages 16–80, heights 120–230 cm and weights 30–250 kg. For ages 16–17 it shows only general training, age-appropriate movement, four-week progression and export; it does not calculate adult BMI categories, energy, body fat, calorie targets, macros or meals. The standalone macro calculator is for adults.

Optional Navy body-fat estimates use the supplied density coefficients with all circumferences and height in centimetres. Inch inputs are first converted to centimetres. An entirely blank set is skipped; incomplete or invalid measurements show an error instead of a fabricated estimate.

Both requested page Titles now contain 51 characters. The homepage H1 is Get Your Personalized Workout Plan. Core code is separated into assets/core.js for testability, an additional local file beyond the original list.

## Source and license

The original taste-skill v2.5.1 assets were copied from Leonxlnx/taste-skill commit f6b76575f949707b4e3c37cd86cb44b0b98643e8 without modifying kit files. Its MIT notice is in licenses/taste-skill-MIT.txt. Page-specific style, copy and calculation logic are separate from kit files. No stock photos, generated photos, remote fonts, shader effects, subscriptions or payment flows are included.
