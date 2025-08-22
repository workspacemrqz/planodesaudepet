import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Heart, 
  Stethoscope, 
  Ambulance,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { NetworkUnit } from "@shared/schema";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNetworkPageData } from "@/hooks/use-parallel-data";
import { NetworkGridSkeleton } from "@/components/loading/network-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { RobustImage } from "@/components/ui/image";
import { OptimizedImage } from "@/components/ui/optimized-image";

// SOLUÇÃO NUCLEAR - ÚNICA E DEFINITIVA
import "@/styles/NUCLEAR_OVERRIDE.css";
import "@/scripts/NUCLEAR_ENFORCER.js";
import "@/scripts/NUCLEAR_TEST.js";

// Fallback image for network units
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWMTAwSDgwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

export default function Network() {
  // Usar hook otimizado para carregamento paralelo de unidades da rede e configurações
  const { data, isLoading } = useNetworkPageData();
  const networkUnits = data.networkUnits;

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const unitsPerPage = 9;

  // Get unique cities and services for filter options
  const uniqueCities = useMemo(() => {
    if (!networkUnits) return [];
    const cities = networkUnits.map(unit => {
      // Extract city from address (assuming format like "Street, City, State")
      const addressParts = unit.address.split(',');
      return addressParts.length > 1 ? addressParts[1].trim() : addressParts[0].trim();
    });
    return Array.from(new Set(cities)).sort();
  }, [networkUnits]);

  const uniqueServices = useMemo(() => {
    if (!networkUnits) return [];
    const allServices = networkUnits.flatMap(unit => unit.services);
    return Array.from(new Set(allServices)).sort();
  }, [networkUnits]);

  // Filter units based on selected criteria
  const filteredUnits = useMemo(() => {
    if (!networkUnits) return [];
    
    return networkUnits.filter(unit => {
      // Text search (name or address)
      const matchesSearch = searchText === "" || 
        unit.name.toLowerCase().includes(searchText.toLowerCase()) ||
        unit.address.toLowerCase().includes(searchText.toLowerCase());

      // City filter - improved logic
      const matchesCity = selectedCity === "all" || 
        unit.address.toLowerCase().includes(selectedCity.toLowerCase());

      // Service filter
      const matchesService = selectedService === "all" ||
        unit.services.some((service: string) => service.toLowerCase().includes(selectedService.toLowerCase()));

      return matchesSearch && matchesCity && matchesService;
    });
  }, [networkUnits, searchText, selectedCity, selectedService]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedCity("all");
    setSelectedService("all");
    setCurrentPage(1); // Reset to first page when clearing filters
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);
  const startIndex = (currentPage - 1) * unitsPerPage;
  const endIndex = startIndex + unitsPerPage;
  const currentUnits = filteredUnits.slice(startIndex, endIndex);
  
  // Effect to reset pagination when filtered results change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredUnits.length, totalPages, currentPage]);

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    
    for (let page = 1; page <= totalPages; page++) {
      const showPage = page === 1 || page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
      
      if (!showPage) {
        // Show ellipsis for gaps
        if (page === currentPage - 2 || page === currentPage + 2) {
          buttons.push(
            <span key={`ellipsis-${page}`} className="px-2 text-[#302e2b]">
              ...
            </span>
          );
        }
        continue;
      }
      
      buttons.push(
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
          className={currentPage === page 
            ? "bg-[#277677] text-[#FBF9F7] hover:bg-[#277677]/90 rounded-full w-9 h-9 p-0" 
            : "border-none bg-transparent text-[#277677] hover:bg-transparent hover:text-[#277677] rounded-full w-9 h-9 p-0"
          }
        >
          {page}
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <main className="min-h-screen bg-[#FBF9F7]">
      {/* Network Units Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedSection animation="slideUp" delay={100}>
              <h1 className="font-bold mb-4 text-[28px] md:text-[36px] text-[#277677]">
                Principais Unidades
              </h1>
            </AnimatedSection>
            
            {/* Filter Section */}
            <AnimatedSection animation="scale" delay={200}>
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg pt-10 pb-6 px-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Search Input */}
                  <div className="contact-form-field relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#302e2b]" />
                    <Input
                      placeholder="Buscar..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="mobile-form-input pl-10"
                      data-testid="input-search-units"
                    />
                  </div>

                  {/* City Filter */}
                  <div className="contact-form-field">
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="mobile-form-input" data-testid="select-city">
                        <SelectValue placeholder="Selecionar cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {uniqueCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Filter */}
                  <div className="contact-form-field">
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="mobile-form-input" data-testid="select-service">
                        <SelectValue placeholder="Selecionar serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os serviços</SelectItem>
                        {uniqueServices.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters and Results Count */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {isLoading ? "Carregando..." : `${filteredUnits.length} unidade${filteredUnits.length !== 1 ? 's' : ''} encontrada${filteredUnits.length !== 1 ? 's' : ''}`}
                  </p>
                  {(searchText || selectedCity !== "all" || selectedService !== "all") && (
                    <Button
                      size="sm"
                      onClick={clearFilters}
                      className="text-[#FBF9F7] border-none flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to top, #1c6363, #277677)'
                      }}
                      data-testid="button-clear-filters"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {isLoading ? (
            <NetworkGridSkeleton />
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#302e2b] text-lg mb-4">Nenhuma unidade encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            <>
              <AnimatedList animation="slideUp" delay={300} staggerDelay={75}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentUnits.map((unit) => (
                    <Card key={unit.id} className="shadow-lg rounded-xl border-none bg-white overflow-hidden flex flex-col h-full">
                      <div className="relative">
                        <OptimizedImage 
                          src={unit.imageUrl}
                          fallback={FALLBACK_IMAGE}
                          alt={unit.name}
                          fallbackSrc={FALLBACK_IMAGE}
                          className="w-full aspect-square object-cover"
                          onError={(error) => console.warn(`Network unit image error for ${unit.name}:`, error)}
                        />
                        <Badge className="absolute top-4 right-4 font-semibold text-[#121212] bg-[#e6a622]">
                          <Star className="h-3 w-3 mr-1" />
                          {(unit.rating / 10).toFixed(1)}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-[#277677] leading-tight">
                          {unit.name}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex flex-col flex-1">
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-4 w-4 text-[#277677] mt-1 flex-shrink-0" />
                            <span className="text-[#302e2b] text-sm">{unit.address}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b] text-sm font-medium">{unit.phone}</span>
                          </div>
                        </div>

                        <div className="mb-6 flex-1">
                          <h4 className="font-semibold text-[#277677] mb-3">Serviços Disponíveis:</h4>
                          <div className="network-services-container space-y-2.5">
                            {unit.services.slice(0, 2).map((service: string, serviceIndex: number) => (
                              <div key={serviceIndex} className="network-services-row">
                                <div className="network-services-badge-wrapper">
                                  <Badge 
                                    className="network-services-badge bg-[#277677]/10 text-[#277677] border-[#277677]/20"
                                    title={service}
                                  >
                                    {service}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {unit.services.length >= 3 && (
                              <div className="network-services-row-with-counter">
                                <div className="network-services-badge-wrapper">
                                  <Badge 
                                    className="network-services-badge bg-[#277677]/10 text-[#277677] border-[#277677]/20"
                                    title={unit.services[2]}
                                  >
                                    {unit.services[2]}
                                  </Badge>
                                </div>
                                {unit.services.length > 3 && (
                                  <Badge className="network-services-counter bg-[#277677]/10 text-[#277677] border-[#277677]/20">
                                    +{unit.services.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                          <Button 
                            className="flex-1 text-[#FBF9F7]"
                            style={{
                              background: 'linear-gradient(to top, #1c6363, #277677)'
                            }}
                            onClick={() => {
                              if (unit.whatsapp) {
                                window.open(`https://wa.me/${unit.whatsapp}`, '_blank');
                              }
                            }}
                            disabled={!unit.whatsapp}
                            data-testid={`button-contact-unit-${unit.id}`}
                          >
                            <FaWhatsapp className="h-4 w-4 mr-2 text-[#FBF9F7]" />
                            Entrar em Contato
                          </Button>
                          <Button 
                            className="border-2 border-[#277677] text-[#277677] bg-[#E9F1F1] hover:bg-[#E9F1F1]/80"
                            onClick={() => {
                              if (unit.googleMapsUrl) {
                                window.open(unit.googleMapsUrl, '_blank');
                              }
                            }}
                            disabled={!unit.googleMapsUrl}
                            data-testid={`button-location-unit-${unit.id}`}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AnimatedList>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-none bg-transparent text-[#277677] hover:bg-transparent hover:text-[#277677]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {generatePaginationButtons()}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-none bg-transparent text-[#277677] hover:bg-transparent hover:text-[#277677]"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}