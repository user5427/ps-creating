import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "../../../store/appStore";
import { EventCard } from "../components/EventCard";
import { useEvents } from "../hooks";
import type { EventResponse } from "../schemas";

const PAGE_SIZE = 12;
const CATALOG_FETCH_SIZE = 500;

type SortOption = "NEW" | "PRICE_ASC" | "PRICE_DESC";

function startOfDay(dateInput: string) {
  return new Date(`${dateInput}T00:00:00`).getTime();
}

function endOfDay(dateInput: string) {
  return new Date(`${dateInput}T23:59:59.999`).getTime();
}

function applyFilters(
  events: EventResponse[],
  filters: {
    category: string;
    location: string;
    startDate: string;
    endDate: string;
  },
) {
  const category = filters.category.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();
  const hasStartDate = filters.startDate.length > 0;
  const hasEndDate = filters.endDate.length > 0;
  const startTs = hasStartDate ? startOfDay(filters.startDate) : null;
  const endTs = hasEndDate ? endOfDay(filters.endDate) : null;

  return events.filter((event) => {
    const eventStartTs = new Date(event.startTime).getTime();

    if (category && event.category.trim().toLowerCase() !== category) {
      return false;
    }

    if (location && !event.venue.toLowerCase().includes(location)) {
      return false;
    }

    if (startTs !== null && eventStartTs < startTs) {
      return false;
    }

    if (endTs !== null && eventStartTs > endTs) {
      return false;
    }

    return true;
  });
}

function applySort(events: EventResponse[], sortBy: SortOption) {
  return [...events].sort((a, b) => {
    if (sortBy === "PRICE_ASC") {
      return a.price - b.price;
    }

    if (sortBy === "PRICE_DESC") {
      return b.price - a.price;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function EventsListPage() {
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("NEW");

  const role = useAppStore((s) => s.role);
  const { data, isLoading, isError, refetch } = useEvents(
    0,
    CATALOG_FETCH_SIZE,
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set((data?.content ?? []).map((event) => event.category)),
      ).sort((a, b) => a.localeCompare(b)),
    [data],
  );

  const filteredAndSortedEvents = useMemo(() => {
    if (!data) {
      return [];
    }

    const filtered = applyFilters(data.content, {
      category: categoryFilter,
      location: locationFilter,
      startDate: startDateFilter,
      endDate: endDateFilter,
    });

    return applySort(filtered, sortBy);
  }, [
    data,
    categoryFilter,
    locationFilter,
    startDateFilter,
    endDateFilter,
    sortBy,
  ]);

  useEffect(() => {
    setPage(0);
  }, [categoryFilter, locationFilter, startDateFilter, endDateFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedEvents.length / PAGE_SIZE),
  );
  const pagedEvents = filteredAndSortedEvents.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  const hasActiveFilters =
    categoryFilter.length > 0 ||
    locationFilter.trim().length > 0 ||
    startDateFilter.length > 0 ||
    endDateFilter.length > 0;

  const hasDateRangeError =
    startDateFilter.length > 0 &&
    endDateFilter.length > 0 &&
    endOfDay(startDateFilter) > endOfDay(endDateFilter);

  function clearFilters() {
    setCategoryFilter("");
    setLocationFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSortBy("NEW");
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: { xs: 4, md: 6 } }}
      >
        <Box>
          <Typography variant="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore upcoming events near you.
          </Typography>
        </Box>
        {role === "ORGANIZER" && (
          <Button
            component={Link}
            to="/events/new"
            variant="contained"
            size="large"
          >
            Create event
          </Button>
        )}
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 4 }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
          <InputLabel id="event-category-filter-label">Category</InputLabel>
          <Select
            labelId="event-category-filter-label"
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All categories</MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Search by venue"
          sx={{ minWidth: { xs: "100%", md: 220 } }}
        />

        <TextField
          size="small"
          label="Start date"
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: "100%", md: 180 } }}
        />

        <TextField
          size="small"
          label="End date"
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: "100%", md: 180 } }}
        />

        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
          <InputLabel id="event-sort-label">Sort by</InputLabel>
          <Select
            labelId="event-sort-label"
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <MenuItem value="NEW">New</MenuItem>
            <MenuItem value="PRICE_ASC">Price ascending</MenuItem>
            <MenuItem value="PRICE_DESC">Price descending</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="text"
          onClick={clearFilters}
          disabled={!hasActiveFilters && sortBy === "NEW"}
        >
          Clear
        </Button>
      </Stack>

      {hasDateRangeError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          End date must be the same as or later than start date.
        </Alert>
      )}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Failed to load events.
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={320}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : data && data.content.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h3" gutterBottom>
            No upcoming events yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {role === "ORGANIZER"
              ? "Be the first — create an event to get started."
              : "Check back soon."}
          </Typography>
          {role === "ORGANIZER" && (
            <Button component={Link} to="/events/new" variant="contained">
              Create event
            </Button>
          )}
        </Box>
      ) : data && filteredAndSortedEvents.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h3" gutterBottom>
            No matching events.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try changing the date range, category, or location filters.
          </Typography>
          <Button variant="outlined" onClick={clearFilters}>
            Clear filters
          </Button>
        </Box>
      ) : data ? (
        <>
          <Grid container spacing={3}>
            {pagedEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, next) => setPage(next - 1)}
                color="primary"
              />
            </Stack>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
