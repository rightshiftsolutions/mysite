# Local MCQ JSON setup

This frontend bundle includes local MCQ JSON files here:

```text
mcq/csharp/csharp-basics-v1.json
mcq/csharp/csharp-oop-v1.json
mcq/csharp/csharp-collections-linq-v1.json
mcq/csharp/csharp-exception-async-v1.json
```

Use VS Code Live Server or any static server from this frontend folder.

If your frontend opens at:

```text
http://127.0.0.1:5500/login.html
```

then set your backend `.env` like this:

```env
GITHUB_PAGES_BASE_URL=http://127.0.0.1:5500
```

If your frontend opens at:

```text
http://localhost:5500/login.html
```

then set your backend `.env` like this:

```env
GITHUB_PAGES_BASE_URL=http://localhost:5500
```

Restart the Node.js backend after changing `.env`.

The started C# seed game uses this DB path:

```text
mcq/csharp/csharp-basics-v1.json
```

So the game page should load:

```text
http://127.0.0.1:5500/mcq/csharp/csharp-basics-v1.json
```

or:

```text
http://localhost:5500/mcq/csharp/csharp-basics-v1.json
```

Do not leave backend `.env` as:

```env
GITHUB_PAGES_BASE_URL=https://your_github_username.github.io/your_repo_name
```

That is only a placeholder.
