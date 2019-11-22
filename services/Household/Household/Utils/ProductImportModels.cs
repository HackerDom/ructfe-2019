using System;
using System.Xml.Serialization;

namespace Household.Utils
{
    [Serializable]
    [XmlRoot(ElementName = "products")]
    public class ProductsImportList
    {
        [XmlElement("product")]
        public ProductImportModel[] Product { get; set; }
    }

    [Serializable]
    [XmlRoot(ElementName = "product")]
    public class ProductImportModel
    {
        public int Id { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("calories")]
        public double Calories { get; set; }

        [XmlElement("protein")]
        public double Protein { get; set; }

        [XmlElement("fat")]
        public double Fat { get; set; }

        [XmlElement("carbohydrate")]
        public double Carbohydrate { get; set; }
    }
}
