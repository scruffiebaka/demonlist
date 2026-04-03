using System;

namespace NARLLGenerator;

class Level
{
    public int id { get; set; }
    public string length {get; set;}
    public string name { get; set; }
    public string author { get; set; }
    public string tags {get; set;}
    public string notes {get; set;}
    public List<string> creators { get; set; }
    public string verifier { get; set; }
    public string verification { get; set; }
    public List<Record> records { get; set; }
}

class Record
{
    public string user { get; set; }
    public string link { get; set; }
    public int percent { get; set; }
    public int hz { get; set; }
}