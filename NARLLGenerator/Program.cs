using NARLLGenerator;
using OfficeOpenXml;
using System.IO;
using System.Text.Json;


async Task<MemoryStream> DownloadSheetAsync()
{
    using var client = new HttpClient();
    var url = "https://docs.google.com/spreadsheets/d/1gsfQKeiUm-mlEayo3e4FskkvuFJtIPjF_ad18j9q9XI/export?format=xlsx";
    var bytes = await client.GetByteArrayAsync(url);

    return new MemoryStream(bytes);
}

using var stream = await DownloadSheetAsync();

ExcelPackage.License.SetNonCommercialPersonal("goop");
using var package = new ExcelPackage(stream);

var dataDir = "data";
Directory.CreateDirectory("data");
foreach (var file in Directory.GetFiles(dataDir, "*.json"))
{
    if (Path.GetFileName(file) == "_editors.json") continue;
    File.Delete(file);
}

var allLevels = new List<Level>();

Level ProcessRowMAIN(ExcelWorksheet sheet, int row)
{
    var name = sheet.Cells[row, 2].Text;
    if (string.IsNullOrWhiteSpace(name)) return null;

    var idText = sheet.Cells[row, 3].Text;
    if (!int.TryParse(idText, out var id)) return null;

    var length = sheet.Cells[row, 4].Text;
    var tags = sheet.Cells[row, 5].Text;
    var author = sheet.Cells[row, 6].Text;
    var verifier = sheet.Cells[row, 7].Text;

    var link = sheet.Cells[row, 2].Hyperlink?.ToString();
    if (link == null)
    {
        link = "https://www.youtube.com/watch?v=JLUHNV2zcV4";
    }

    var victorsRaw = sheet.Cells[row, 10].Text;

    var records = victorsRaw
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(v => new Record
        {
            user = v.Trim(),
            link = "",
            percent = 100,
            hz = 0
        })
        .ToList();
    
    var notes = sheet.Cells[row, 11].Text;

    return new Level
        {
            id = id,
            name = name,
            length = length,
            author = author,
            tags = tags,
            creators = new List<string> { author },
            verifier = verifier,
            verification = link,
            records = records,
            notes = notes
        };
    }

Level ProcessRowLEGACY(ExcelWorksheet sheet, int row)
{
    var name = sheet.Cells[row, 2].Text;
    if (string.IsNullOrWhiteSpace(name)) return null;

    var idText = sheet.Cells[row, 3].Text;
    if (!int.TryParse(idText, out var id)) return null;

    var author = sheet.Cells[row, 4].Text;
    var verifier = sheet.Cells[row, 5].Text;

    var link = sheet.Cells[row, 2].Hyperlink?.ToString();
    if (link == null)
    {
        link = "https://www.youtube.com/watch?v=JLUHNV2zcV4";
    }

    var victorsRaw = sheet.Cells[row, 7].Text;

    var records = victorsRaw
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(v => new Record
        {
            user = v.Trim(),
            link = "",
            percent = 100,
            hz = 0
        })
        .ToList();
    
    var notes = sheet.Cells[row, 8].Text;

    return new Level
        {
            id = id,
            name = name,
            length = "NA",
            author = author,
            tags = "NA",
            creators = new List<string> { author },
            verifier = verifier,
            verification = link,
            records = records,
            notes = notes
        };
    }

string MakeSafeFileName(string name)
{
    var invalid = Path.GetInvalidFileNameChars();
    return new string(name.Where(c => !invalid.Contains(c)).ToArray())
        .Replace("\n", "")
        .Replace("\r", "");
}

var sheet1 = package.Workbook.Worksheets[2];
var sheet2 = package.Workbook.Worksheets["Legacy List"];

for (int row = 3; row <= 52; row++)
{
    var level = ProcessRowMAIN(sheet1, row);
    if (level == null) continue;

    var json = JsonSerializer.Serialize(level, new JsonSerializerOptions
    {
        WriteIndented = true
    });

    var safeName = MakeSafeFileName(level.name);
    File.WriteAllText($"data/{safeName}.json", json);
    allLevels.Add(level);
}

for (int row = 3; row <= 18; row++)
{
    var level = ProcessRowLEGACY(sheet2, row);
    if (level == null) continue;

    var json = JsonSerializer.Serialize(level, new JsonSerializerOptions
    {
        WriteIndented = true
    });

    var safeName = MakeSafeFileName(level.name);
    File.WriteAllText($"data/{safeName}.json", json);
    allLevels.Add(level);
}

var nameList = allLevels.Select(l => l.name).ToList();

var listJson = JsonSerializer.Serialize(nameList, new JsonSerializerOptions
{
    WriteIndented = true
});

File.WriteAllText("data/_list.json", listJson);